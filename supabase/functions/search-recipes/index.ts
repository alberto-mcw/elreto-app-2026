import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

const ALLOWED_ORIGINS = [
  "https://elretomcw.vercel.app",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const corsHeaders = getCorsHeaders(req);

  const kv = await Deno.openKv();
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rlKey = `search-recipes:${clientIp}`;
  const { allowed } = await checkRateLimit(kv, rlKey, 60, 3_600_000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo más tarde." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { query, recipes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Sanitize query: limit length and strip prompt injection patterns
    const sanitizedQuery = (query ?? "")
      .slice(0, 200)
      .replace(/[`]/g, "")
      .replace(/ignore\s+(?:previous|all)\s+instructions/gi, "")
      .trim();

    if (!sanitizedQuery || !recipes || recipes.length === 0) {
      return new Response(
        JSON.stringify({ matchedIds: [], message: "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build compact recipe summaries for the AI
    const recipeSummaries = recipes.map((r: any) => ({
      id: r.id,
      title: r.title,
      tags: r.tags || [],
      type: r.recipe_type || "",
      time: r.estimated_time || "",
      difficulty: r.difficulty || "",
      ingredients: r.ingredients || [],
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Eres un asistente de cocina. El usuario busca recetas en su biblioteca personal.
Dada su consulta en lenguaje natural, devuelve los IDs de las recetas que mejor coincidan ordenados por relevancia.
También genera un mensaje corto y cálido (máximo 15 palabras) explicando los resultados.

Interpreta consultas como:
- "algo rápido" → buscar tags "express" o tiempo corto
- "para cenar" → tags "cena" o tipo "salado"/"principal"
- "sin gluten" → tags "sin gluten"
- "algo dulce" → tipo "dulce"/"postre" o tags "postre"/"merienda"
- "con pollo" → ingredientes que contengan "pollo"
- "fácil" → dificultad "facil"
- "thermomix" → tags "thermomix"
- "saludable" → tags "saludable"/"bajo en calorías"

Responde SOLO un JSON: {"matchedIds": ["id1","id2",...], "message": "texto"}
Si ninguna receta coincide, devuelve matchedIds vacío y un mensaje amable.`,
          },
          {
            role: "user",
            content: `Consulta: "${sanitizedQuery}"\n\nRecetas disponibles:\n${JSON.stringify(recipeSummaries)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas búsquedas, espera un momento" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      throw new Error(`AI error ${response.status}: ${t}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let result = { matchedIds: [] as string[], message: "" };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // fallback
    }

    // Only return IDs that were actually in the input recipes array
    const validIds = new Set((recipes as any[]).map((r: any) => r.id));
    result.matchedIds = (result.matchedIds ?? []).filter((id: string) => validIds.has(id));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-recipes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
