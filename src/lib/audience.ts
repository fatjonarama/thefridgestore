export type Audience = "men" | "women" | "kids";

// "kids" stays in the type/DB enum for backward compatibility, but is no
// longer offered anywhere in the UI — see db/queries.ts for the storefront
// filter that keeps any legacy kids rows from surfacing.
export const AUDIENCES: Audience[] = ["men", "women"];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
};

export function isAudience(value: string): value is Audience {
  return (AUDIENCES as string[]).includes(value);
}
