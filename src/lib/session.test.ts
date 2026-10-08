import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-not-for-real-use";
});

describe("session cookie signing", () => {
  it("round-trips a valid signed cookie back to the user id", async () => {
    const { createSessionCookieValue, verifySessionCookieValue } = await import("./session");
    const value = createSessionCookieValue(42);
    expect(verifySessionCookieValue(value)).toBe(42);
  });

  it("rejects an undefined cookie", async () => {
    const { verifySessionCookieValue } = await import("./session");
    expect(verifySessionCookieValue(undefined)).toBeNull();
  });

  it("rejects a malformed cookie (no signature)", async () => {
    const { verifySessionCookieValue } = await import("./session");
    expect(verifySessionCookieValue("not-a-real-cookie")).toBeNull();
  });

  it("rejects a tampered payload (signature no longer matches)", async () => {
    const { createSessionCookieValue, verifySessionCookieValue } = await import("./session");
    const value = createSessionCookieValue(42);
    const [, signature] = value.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ uid: 999, exp: Date.now() + 100000 })).toString(
      "base64url",
    );
    expect(verifySessionCookieValue(`${tamperedPayload}.${signature}`)).toBeNull();
  });

  it("rejects an expired cookie", async () => {
    vi.useFakeTimers();
    const { createSessionCookieValue, verifySessionCookieValue } = await import("./session");
    const value = createSessionCookieValue(42);
    vi.advanceTimersByTime(31 * 24 * 60 * 60 * 1000); // 31 days, past the 30-day max age
    expect(verifySessionCookieValue(value)).toBeNull();
    vi.useRealTimers();
  });
});
