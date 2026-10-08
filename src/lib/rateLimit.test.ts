import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, requestIp } from "./rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, { max: 3, windowMs: 1000 }).allowed).toBe(true);
    }
  });

  it("blocks once the limit is exceeded within the window", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, { max: 3, windowMs: 1000 });
    const result = checkRateLimit(key, { max: 3, windowMs: 1000 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window passes", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, { max: 3, windowMs: 1000 });
    expect(checkRateLimit(key, { max: 3, windowMs: 1000 }).allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(checkRateLimit(key, { max: 3, windowMs: 1000 }).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const keyA = `test-a:${Math.random()}`;
    const keyB = `test-b:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(keyA, { max: 3, windowMs: 1000 });
    expect(checkRateLimit(keyA, { max: 3, windowMs: 1000 }).allowed).toBe(false);
    expect(checkRateLimit(keyB, { max: 3, windowMs: 1000 }).allowed).toBe(true);
  });
});

describe("requestIp", () => {
  it("reads the first address from x-forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(requestIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(requestIp(req)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' with no identifying headers", () => {
    const req = new Request("https://example.com");
    expect(requestIp(req)).toBe("unknown");
  });
});
