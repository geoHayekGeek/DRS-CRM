/**
 * Format points for display. Supports 2 decimal places.
 * 25 -> "25", 12.5 -> "12.5"
 */
export function formatPoints(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, "");
}
