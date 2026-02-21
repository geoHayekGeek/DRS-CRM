import { db } from "@/lib/db";

const TOP_PER_GROUP = 3;

export type FinalQualifyingCheckResult =
  | { ready: false; drivers: []; groupsMissingResults: string[] }
  | { ready: true; drivers: { id: string; fullName: string; group: string }[] };

export async function getFinalQualifyingDrivers(
  roundId: string
): Promise<FinalQualifyingCheckResult> {
  const groups = await db.groupAssignment.findMany({
    where: { roundId },
    select: { group: true },
    distinct: ["group"],
    orderBy: { group: "asc" },
  });
  const groupLabels = groups.map((g) => g.group);

  if (groupLabels.length === 0) {
    return { ready: false, drivers: [], groupsMissingResults: [] };
  }

  const drivers: { id: string; fullName: string; group: string }[] = [];
  const groupsMissingResults: string[] = [];

  for (const group of groupLabels) {
    const qualifyingSession = await db.session.findFirst({
      where: {
        roundId,
        type: "QUALIFYING",
        group,
      },
      include: {
        results: {
          orderBy: { position: "asc" },
          take: TOP_PER_GROUP,
          include: {
            driver: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });

    if (!qualifyingSession || qualifyingSession.results.length === 0) {
      groupsMissingResults.push(group);
    } else {
      for (const r of qualifyingSession.results) {
        drivers.push({
          id: r.driver.id,
          fullName: r.driver.fullName,
          group,
        });
      }
    }
  }

  if (groupsMissingResults.length > 0) {
    return {
      ready: false,
      drivers: [],
      groupsMissingResults,
    };
  }

  return { ready: true, drivers };
}
