export enum PointsMultiplier {
  NORMAL = "NORMAL",
  HALF = "HALF",
  DOUBLE = "DOUBLE",
}

export enum SessionType {
  QUALIFYING = "QUALIFYING",
  RACE = "RACE",
  FINAL_QUALIFYING = "FINAL_QUALIFYING",
  FINAL_RACE = "FINAL_RACE",
}

/**
 * Calculate points for a qualifying session position.
 * P1 gets 1 point, all others get 0.
 */
export function calculateQualifyingPoints(position: number): number {
  return position === 1 ? 1 : 0;
}

/**
 * Calculate base points for a race session position.
 * P1: 25, P2: 18, P3: 15, P4: 12, P5: 10, P6: 8, P7: 6, P8: 4, P9: 2, P10: 1
 * Positions > 10: 0
 */
export function calculateRacePoints(position: number): number {
  const pointsMap: Record<number, number> = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1,
  };

  return pointsMap[position] || 0;
}

/**
 * Apply multiplier to points.
 * HALF: divide by 2, round to 2 decimal places (e.g. 25 -> 12.5).
 * NORMAL: no change (100%)
 * DOUBLE: multiply by 2 (200%)
 */
export function applyMultiplier(
  points: number,
  multiplier: PointsMultiplier | null
): number {
  if (!multiplier || multiplier === PointsMultiplier.NORMAL) {
    return points;
  }

  if (multiplier === PointsMultiplier.HALF) {
    return Math.round((points / 2) * 100) / 100;
  }

  if (multiplier === PointsMultiplier.DOUBLE) {
    return points * 2;
  }

  return points;
}

/**
 * Calculate points for a session based on type, position, and optional multiplier.
 * Qualifying sessions ignore multiplier.
 * Race sessions require multiplier.
 */
export function calculateSessionPoints(
  sessionType: SessionType,
  position: number,
  multiplier: PointsMultiplier | null = null
): number {
  let basePoints: number;

  if (
    sessionType === SessionType.QUALIFYING ||
    sessionType === SessionType.FINAL_QUALIFYING
  ) {
    basePoints = calculateQualifyingPoints(position);
    // Qualifying sessions don't use multipliers
    return basePoints;
  }

  if (sessionType === SessionType.RACE || sessionType === SessionType.FINAL_RACE) {
    basePoints = calculateRacePoints(position);
    // Race sessions require multiplier
    return applyMultiplier(basePoints, multiplier);
  }

  return 0;
}
