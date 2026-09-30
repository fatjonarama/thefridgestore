export const COUNTRIES = ["Kosovo", "Albania", "North Macedonia"] as const;
export type Country = (typeof COUNTRIES)[number];

export const SHIPPING_CENTS: Record<Country, number> = {
  Kosovo: 200,
  Albania: 500,
  "North Macedonia": 500,
};

export const DELIVERY_ESTIMATE_DAYS: Record<Country, string> = {
  Kosovo: "1-2 days",
  Albania: "3-4 days",
  "North Macedonia": "3-4 days",
};

export function isCountry(value: string): value is Country {
  return (COUNTRIES as readonly string[]).includes(value);
}
