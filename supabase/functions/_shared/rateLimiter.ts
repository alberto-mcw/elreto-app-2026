/**
 * Sliding window rate limiter using Deno KV.
 * @param kv - Deno KV instance
 * @param key - Unique key (e.g., "transcribe-video:user-uuid")
 * @param limit - Max requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @returns { allowed: boolean, remaining: number }
 */
export async function checkRateLimit(
  kv: Deno.Kv,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const kvKey = ["rate_limit", key];

  // Get existing timestamps
  const result = await kv.get<number[]>(kvKey);
  const timestamps: number[] = (result.value ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Add current timestamp
  timestamps.push(now);
  await kv.set(kvKey, timestamps, { expireIn: windowMs });

  return { allowed: true, remaining: limit - timestamps.length };
}
