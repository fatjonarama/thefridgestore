import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and dashes spaces", () => {
    expect(slugify("Mock Runner One")).toBe("mock-runner-one");
  });

  it("strips punctuation", () => {
    expect(slugify("DSquared2 Icon '24")).toBe("dsquared2-icon-24");
  });

  it("collapses repeated separators and trims leading/trailing dashes", () => {
    expect(slugify("  --Air   Max--  ")).toBe("air-max");
  });
});
