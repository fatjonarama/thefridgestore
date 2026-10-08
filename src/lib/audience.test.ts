import { describe, expect, it } from "vitest";
import { AUDIENCES, isAudience, matchesAudience } from "./audience";

describe("isAudience", () => {
  it("accepts every value in AUDIENCES", () => {
    for (const a of AUDIENCES) expect(isAudience(a)).toBe(true);
  });

  it("rejects unknown strings, including the retired 'kids' value", () => {
    expect(isAudience("kids")).toBe(false);
    expect(isAudience("toddlers")).toBe(false);
    expect(isAudience("")).toBe(false);
  });
});

describe("matchesAudience", () => {
  it("a unisex product shows up when browsing men or women", () => {
    expect(matchesAudience("unisex", "men")).toBe(true);
    expect(matchesAudience("unisex", "women")).toBe(true);
  });

  it("a men's/women's product does not show up under the other filter", () => {
    expect(matchesAudience("men", "women")).toBe(false);
    expect(matchesAudience("women", "men")).toBe(false);
  });

  it("matches the exact same audience", () => {
    expect(matchesAudience("men", "men")).toBe(true);
    expect(matchesAudience("women", "women")).toBe(true);
  });

  it("explicitly filtering 'unisex' only matches unisex products", () => {
    expect(matchesAudience("unisex", "unisex")).toBe(true);
    expect(matchesAudience("men", "unisex")).toBe(false);
    expect(matchesAudience("women", "unisex")).toBe(false);
  });
});
