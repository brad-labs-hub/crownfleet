type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type RequestContext = {
  requestId: string;
  ip: string;
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function nowMs() {
  return Date.now();
}

export function getRequestContext(request: Request): RequestContext {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  return { requestId, ip };
}

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { key, limit, windowMs } = options;
  const currentTime = nowMs();
  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt <= currentTime) {
    const resetAt = currentTime + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    resetAt: existing.resetAt,
  };
}

export function logApiEvent(
  level: "info" | "error",
  route: string,
  requestId: string,
  details: Record<string, unknown>
) {
  const payload = {
    level,
    route,
    requestId,
    timestamp: new Date().toISOString(),
    ...details,
  };
  const serialized = JSON.stringify(payload);
  if (level === "error") {
    console.error(serialized);
    return;
  }
  console.log(serialized);
}
