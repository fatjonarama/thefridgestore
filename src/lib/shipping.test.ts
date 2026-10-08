import { describe, expect, it } from "vitest";
import { COUNTRIES, DELIVERY_ESTIMATE_DAYS, isCountry, SHIPPING_CENTS } from "./shipping";

describe("shipping config", () => {
  it("has a shipping cost for every supported country", () => {
    for (const country of COUNTRIES) {
      expect(typeof SHIPPING_CENTS[country]).toBe("number");
      expect(SHIPPING_CENTS[country]).toBeGreaterThan(0);
    }
  });

  it("has a delivery estimate for every supported country", () => {
    for (const country of COUNTRIES) {
      expect(typeof DELIVERY_ESTIMATE_DAYS[country]).toBe("string");
      expect(DELIVERY_ESTIMATE_DAYS[country].length).toBeGreaterThan(0);
    }
  });
});

describe("isCountry", () => {
  it("accepts every supported country", () => {
    for (const country of COUNTRIES) expect(isCountry(country)).toBe(true);
  });

  it("rejects unsupported strings", () => {
    expect(isCountry("Germany")).toBe(false);
    expect(isCountry("")).toBe(false);
  });
});
