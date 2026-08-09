export function formatCents(cents: number) {
  const euros = cents / 100;
  return euros % 1 === 0 ? `€${euros.toFixed(0)}` : `€${euros.toFixed(2)}`;
}

export function eurosToCents(value: string | number) {
  const euros = typeof value === "string" ? Number(value) : value;
  return Math.round(euros * 100);
}
