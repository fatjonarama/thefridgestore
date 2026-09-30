export type Audience = "men" | "women" | "unisex" | "kids";

// "kids" stays in the type/DB enum for backward compatibility, but is no
// longer offered anywhere in the UI — see db/queries.ts for the storefront
// filter that keeps any legacy kids rows from surfacing.
export const AUDIENCES: Audience[] = ["men", "women", "unisex"];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
  kids: "Kids",
};

export function isAudience(value: string): value is Audience {
  return (AUDIENCES as string[]).includes(value);
}

// A product tagged "unisex" belongs in both the men's and women's shop
// views (as well as its own), so "browsing men" means "audience is men
// or unisex" rather than a strict equality check.
export function matchesAudience(productAudience: Audience, filter: Audience): boolean {
  if (filter === "unisex") return productAudience === "unisex";
  return productAudience === filter || productAudience === "unisex";
}
