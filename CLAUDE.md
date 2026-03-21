# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Dev server at localhost:5173
npm run dev:mobile     # Dev server on 0.0.0.0 (real device testing on LAN)
npm run build          # Production build
npm run build:dev      # Build in development mode
npm run lint           # ESLint
npm run check          # TypeScript type-check (tsc --noEmit) — run this before committing
```

No test suite exists (CLEAN-4 audit item).

## Deployment

- **Production URL:** https://elreto-app-2026.vercel.app
- **Git remote:** `new-origin` → `https://github.com/alberto-mcw/elreto-app-2026`
- Push to `main` to deploy: `git push new-origin main`
- Vercel project: `elreto-app-2026` (account: albertonicolas-5512s / masterchefworld.app)

### Edge Functions & Migrations

The Supabase CLI must be installed separately and authenticated (`supabase login`). The `supabase/` directory is the project config folder, not a binary.

```bash
supabase functions deploy --project-ref rpuqbtcxdvaamiitmchd   # deploy all edge functions
supabase db push --linked --yes                                  # apply pending migrations
```

## Architecture Overview

**Stack:** Vite 5 + React 18 + TypeScript (strict) + Tailwind CSS 3 + shadcn-ui + Supabase

### Dual-Surface Pattern

The app serves two distinct UIs from the same codebase:
- **Web** (`/`, `/dashboard`, `/ranking`, `/recetario/*`, etc.) — desktop-first public site
- **Mobile app** (`/app/*`) — mobile-optimized UI with bottom nav; `useMobileRedirect` auto-redirects `/` → `/app` on iOS/Android

Both surfaces share the same auth, hooks, and Supabase client. Routes under `/app/*` mirror many web routes but use `MobileAppLayout` with `BottomNav`.

### Route Structure

```
App.tsx
├── Public: / /ranking /calendario /bases /contacto /descarga /auth /install /inscripcion
├── Protected: /dashboard /profile
├── Admin: /admin /admin/usuarios  (requiredRole="admin")
├── Chef Events: /sigue-al-chef/:id, /live, /resultado
├── Mobile App: /app  /app/recetas  /app/perfil  /app/galeria ...
│   └── /app/sigue-al-chef/:id, /live, /resultado
└── Recetario: /recetario  /recetario/subir  /recetario/biblioteca
              /recetario/receta/:id  /recetario/compartida/:token
              /recetario/explorar  /recetario/que-cocino
```

### Auth

`AuthProvider` + `useAuth` hook (`src/hooks/useAuth.tsx`) wrap the entire app. Auth state is set via `onAuthStateChange` first, then `getSession()`. Session persists in localStorage (CLEAN-6: long-term migration to httpOnly cookies pending).

`ProtectedRoute` (`src/components/ProtectedRoute.tsx`) — renders `null` while auth resolves (prevents flash), then redirects unauthenticated → `/auth` or non-admins → `/dashboard`.

Admin check uses `useAdmin` hook, which caches the result in `sessionStorage` under `admin:{userId}` to avoid repeated DB queries.

### Supabase

- **Client:** `src/integrations/supabase/client.ts` — env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Types:** `src/integrations/supabase/types.ts` (41 KB, auto-generated — do not edit manually)
- **Project ref:** `rpuqbtcxdvaamiitmchd`

#### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (display_name, energy, country, banned_at) |
| `challenges` / `challenge_completions` | Daily/weekly challenges + user completions |
| `challenge_submissions` | Weekly video challenge submissions (with transcription) |
| `chef_events` / `chef_event_steps` / `chef_event_participants` / `chef_event_scores` / `chef_step_submissions` | Live cooking event system |
| `chef_ai_evaluations` | AI scoring of chef event submissions |
| `recipes` / `recipe_collections` / `recipe_collection_items` / `recipe_shares` / `recipe_interactions` | Recetario system |
| `recetario_leads` | Unauthenticated users who submitted recipes via email |
| `daily_trivias` / `trivia_completions` | Daily trivia challenges |
| `presentation_videos` | User intro videos (admin reviewed) |
| `reto_enrollments` | Competition enrollment |
| `user_roles` | Role-based access (`admin`) |
| `social_verifications` / `super_likes` / `video_likes` | Social features |
| `admin_audit_log` | Audit trail for admin actions (ban, role changes) |

Key DB functions: `has_role(uid, role)`, `increment_user_energy(uid, amount)`, `check_trivia_answer(...)`, `get_ranking_countries()`, `admin_ban_user(...)`, `admin_toggle_role(...)`.

### Data Layer

All Supabase calls are encapsulated in custom hooks in `src/hooks/`. Hooks manage their own `loading`/`error` state directly — they do **not** use React Query (which is configured globally but unused by hooks). React Query config: `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`.

### Edge Functions

7 Deno Edge Functions in `supabase/functions/`. All have `verify_jwt = false` in `config.toml` (auth is handled manually inside each function). Shared module at `supabase/functions/_shared/rateLimiter.ts` (Deno KV rate limiting).

| Function | Auth | Purpose |
|----------|------|---------|
| `transcribe-video` | Required | Transcribes challenge submission videos via ElevenLabs |
| `extract-recipe` | Required | Extracts structured recipe data from submission transcription via AI |
| `generate-daily-challenge` | Required | Generates AI trivia challenges (with optional brand context) |
| `analyze-metrics` | Required | Extracts views/likes from social media screenshot via vision AI; SSRF-protected (Supabase storage URLs only) |
| `process-recipe` | Optional (lead flow allowed) | Swiss Army knife: 13 actions (ocr, structure, full-process, full-process-text, full-process-audio, full-process-url, healthy, alternatives, shopping-list, adjust-servings, generate-image, generate-tags, update-recipe) |
| `what-to-cook` | Optional (lead flow allowed) | Recommends recipes from user's pantry photos using AI vision |
| `search-recipes` | Optional | Natural language recipe search (AI-powered, query sanitized) |

**Security patterns in edge functions:**
- CORS restricted to `[elreto-app-2026.vercel.app, localhost:5173]` — never `"*"`
- Auth: `Authorization` header → `createClient(url, anonKey, { global: { headers } })` → `auth.getUser()`
- Ownership: verify `recipe.user_id === user.id` before processing; if `recipe.user_id IS NULL` and `recipe.lead_id IS NOT NULL` → lead flow, allow without auth
- Rate limits via Deno KV (5–60 req/hour depending on function)

All functions call the Lovable AI gateway (`ai.gateway.lovable.dev`) with `LOVABLE_API_KEY`. `transcribe-video` and `process-recipe` (audio) also use `ELEVENLABS_API_KEY`.

### Recetario Lead Flow

Unauthenticated users can access the recipe system by providing their email at `/recetario/captura`. This creates a `recetario_leads` record and stores `recetario_lead_id` + `recetario_email` in `sessionStorage`. All subsequent Recetario pages read these keys to identify lead ownership. Recipes created by leads have `user_id = null` and `lead_id = <uuid>`.

### Realtime

`useChefEvents` uses Supabase Realtime to subscribe to step updates and event state changes during live chef events.

### Admin System

Admin actions (ban/unban, role grant/revoke) go through SECURITY DEFINER RPC functions (`admin_ban_user`, `admin_toggle_role`) that verify the caller's admin role server-side and write to `admin_audit_log`. `AdminUsers.tsx` uses `supabase.rpc()` for these — never direct table mutations.

## Environment Variables

```
VITE_SUPABASE_URL=https://rpuqbtcxdvaamiitmchd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_SUPABASE_PROJECT_ID=rpuqbtcxdvaamiitmchd
```

## Known Pending Items

- **CLEAN-4:** No test suite — framework decision needed before adding
- **CLEAN-6:** Auth tokens in localStorage — long-term httpOnly cookie migration
- **TS-2:** ~7 remaining `as any` casts in `RecetarioBiblioteca.tsx`
- Existing users must use "Forgot Password" (passwords not migrated between Supabase projects)
- `analyze-metrics` missing in `config.toml` (no `verify_jwt = false` entry) — add when deploying
