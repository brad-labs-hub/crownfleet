import { describe, expect, it } from "vitest";
import { checkRateLimit, getRequestContext } from "@/lib/api-ops";

describe("api-ops", () => {
  it("extracts request context fields", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-request-id": "req-123",
        "x-forwarded-for": "203.0.113.5, 10.0.0.1",
      },
    });

    const context = getRequestContext(request);
    expect(context.requestId).toBe("req-123");
    expect(context.ip).toBe("203.0.113.5");
  });

  it("enforces rate limit within a fixed window", () => {
    const first = checkRateLimit({ key: "test-key", limit: 2, windowMs: 10_000 });
    const second = checkRateLimit({ key: "test-key", limit: 2, windowMs: 10_000 });
    const third = checkRateLimit({ key: "test-key", limit: 2, windowMs: 10_000 });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });
});
