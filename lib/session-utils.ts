const SESSION_TYPE_LABELS: Record<string, string> = {
  QUALIFYING: "Qualifying",
  RACE: "Race",
  FINAL_QUALIFYING: "Final Qualifying",
  FINAL_RACE: "Final Race",
};

export function getSessionDisplayName(
  type: string,
  group: string | null,
  order?: number
): string {
  const typeLabel = SESSION_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
  if (group) {
    return `Group ${group} - ${typeLabel}`;
  }
  if (type === "QUALIFYING" && order != null) {
    return `Qualifying ${order}`;
  }
  return typeLabel;
}
