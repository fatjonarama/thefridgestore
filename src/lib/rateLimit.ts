// In-memory fixed-window rate limiter. Good enough for a low-traffic store
// on serverless (resets per cold start, doesn't share state across
// instances) without adding an external dependency like Redis. Combined
// with scrypt's inherent per-attempt cost, this meaningfully raises the
// bar on brute-forcing /api/auth/* without any new infrastructure.
const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_BUCKETS = 5000;

export function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function requestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
