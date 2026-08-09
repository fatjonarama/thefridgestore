export const COUNTRIES = ["Kosovo", "Albania", "North Macedonia"] as const;
export type Country = (typeof COUNTRIES)[number];

export const SHIPPING_CENTS: Record<Country, number> = {
  Kosovo: 200,
  Albania: 500,
  "North Macedonia": 500,
};

export function isCountry(value: string): value is Country {
  return (COUNTRIES as readonly string[]).includes(value);
}
