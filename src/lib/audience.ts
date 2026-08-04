export type Audience = "men" | "women" | "kids";

export const AUDIENCES: Audience[] = ["men", "women", "kids"];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
};

export function isAudience(value: string): value is Audience {
  return (AUDIENCES as string[]).includes(value);
}
