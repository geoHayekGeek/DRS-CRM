import { db } from "@/lib/db";

export type FinalRaceCheckResult =
  | { ready: false; drivers: [] }
  | {
      ready: true;
      drivers: { id: string; fullName: string; group: string }[];
    };

/**
 * Final Race participants = drivers from FINAL_QUALIFYING results, ordered by position.
 * If FINAL_QUALIFYING has no results, Final Race is not ready.
 */
export async function getFinalRaceDrivers(
  roundId: string
): Promise<FinalRaceCheckResult> {
  const finalQualifyingSession = await db.session.findFirst({
    where: {
      roundId,
      type: "FINAL_QUALIFYING",
      group: null,
    },
    include: {
      results: {
        orderBy: { position: "asc" },
        include: {
          driver: {
            select: { id: true, fullName: true },
          },
        },
      },
    },
  });

  if (
    !finalQualifyingSession ||
    finalQualifyingSession.results.length === 0
  ) {
    return { ready: false, drivers: [] };
  }

  const groupByDriver = await db.groupAssignment.findMany({
    where: {
      roundId,
      driverId: {
        in: finalQualifyingSession.results.map((r) => r.driverId),
      },
    },
    select: { driverId: true, group: true },
  });
  const groupMap = new Map(groupByDriver.map((g) => [g.driverId, g.group]));

  const drivers = finalQualifyingSession.results.map((r) => ({
    id: r.driver.id,
    fullName: r.driver.fullName,
    group: groupMap.get(r.driver.id) ?? "—",
  }));

  return { ready: true, drivers };
}
