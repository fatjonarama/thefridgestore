export function formatCents(cents: number) {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toFixed(0)}`
    : `$${dollars.toFixed(2)}`;
}

export function dollarsToCents(value: string | number) {
  const dollars = typeof value === "string" ? Number(value) : value;
  return Math.round(dollars * 100);
}
