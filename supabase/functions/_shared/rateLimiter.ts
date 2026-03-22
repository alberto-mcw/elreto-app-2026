/**
 * Sliding window rate limiter using Deno KV with atomic compare-and-set.
 * Prevents race conditions via optimistic concurrency control.
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

  // Retry loop for optimistic concurrency
  for (let attempt = 0; attempt < 3; attempt++) {
    const entry = await kv.get<number[]>(kvKey);
    const timestamps: number[] = (entry.value ?? []).filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      return { allowed: false, remaining: 0 };
    }

    const updated = [...timestamps, now];
    const result = await kv
      .atomic()
      .check(entry) // only commit if no one else wrote since we read
      .set(kvKey, updated, { expireIn: windowMs })
      .commit();

    if (result.ok) {
      return { allowed: true, remaining: limit - updated.length };
    }
    // Another request beat us — retry
  }

  // After 3 failed attempts, fail closed (deny)
  return { allowed: false, remaining: 0 };
}
