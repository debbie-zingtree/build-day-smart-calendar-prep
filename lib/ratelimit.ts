// In-memory, per-email rate limit: 10 briefs / hour. Prevents API-key abuse.
//
// v1 limitation: this resets on server restart and is per-instance (not shared
// across serverless invocations). Persistent (DB-backed) limiting is v2 — see
// spec/plan.md "Deferred / Future".

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 10;

const hitsByEmail = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(email: string): RateLimitResult {
  const key = email.trim().toLowerCase();
  const now = Date.now();

  const recent = (hitsByEmail.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hitsByEmail.set(key, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  hitsByEmail.set(key, recent);
  return { allowed: true, remaining: MAX_PER_WINDOW - recent.length };
}
