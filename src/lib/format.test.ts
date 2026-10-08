import { describe, expect, it } from "vitest";
import { eurosToCents, formatCents } from "./format";

describe("formatCents", () => {
  it("drops decimals for whole euro amounts", () => {
    expect(formatCents(12000)).toBe("€120");
  });

  it("keeps two decimals for fractional amounts", () => {
    expect(formatCents(12050)).toBe("€120.50");
  });

  it("handles zero", () => {
    expect(formatCents(0)).toBe("€0");
  });
});

describe("eurosToCents", () => {
  it("converts a plain number", () => {
    expect(eurosToCents(120)).toBe(12000);
  });

  it("converts a numeric string", () => {
    expect(eurosToCents("49.99")).toBe(4999);
  });

  it("rounds to the nearest cent", () => {
    expect(eurosToCents(19.999)).toBe(2000);
  });
});
