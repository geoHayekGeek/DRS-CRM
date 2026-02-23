/**
 * Round status is computed dynamically. Do not store in DB.
 */
export type RoundStatus = "UPCOMING" | "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type RoundStatusInput = {
  date: Date | string;
  numberOfGroups: number;
  setupCompleted: boolean;
  driverCount: number;
  /** True when all sessions exist and all have results (or status COMPLETED) */
  allSessionsComplete: boolean;
};

/**
 * Get round status from round data and relations.
 * - PENDING: setup not completed (e.g. no groups/drivers run yet)
 * - UPCOMING: setup done AND round date is in the future
 * - IN_PROGRESS: setup done, date on or past, not all sessions complete
 * - COMPLETED: all races and qualifying sessions are completed (not based on date)
 */
export function getRoundStatus(input: RoundStatusInput): RoundStatus {
  if (!input.setupCompleted) return "PENDING";

  const date = typeof input.date === "string" ? new Date(input.date) : input.date;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const isFuture = date.getTime() > today.getTime();

  if (isFuture) return "UPCOMING";

  const hasDrivers = input.driverCount > 0;
  const hasGroups = input.numberOfGroups > 0;
  if (!hasDrivers || !hasGroups) return "PENDING";

  if (input.allSessionsComplete) return "COMPLETED";

  return "IN_PROGRESS";
}
