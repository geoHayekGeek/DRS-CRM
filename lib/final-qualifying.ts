import { db } from "@/lib/db";

const TOP_PER_GROUP = 3;
const PRELIMINARY_SESSION_TYPES = ["QUALIFYING", "RACE"] as const;

export type FinalQualifyingCheckResult =
  | { ready: false; drivers: []; groupsMissingResults: string[] }
  | { ready: true; drivers: { id: string; fullName: string; group: string }[] };

export async function getFinalQualifyingDrivers(
  roundId: string
): Promise<FinalQualifyingCheckResult> {
  const assignments = await db.groupAssignment.findMany({
    where: { roundId },
    select: {
      group: true,
      driverId: true,
      driver: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: { group: "asc" },
  });

  const groupLabels = Array.from(new Set(assignments.map((a) => a.group))).sort(
    (a, b) => a.localeCompare(b)
  );

  if (groupLabels.length === 0) {
    return { ready: false, drivers: [], groupsMissingResults: [] };
  }

  const driversByGroup = new Map<
    string,
    { id: string; fullName: string }[]
  >();
  for (const assignment of assignments) {
    if (!driversByGroup.has(assignment.group)) {
      driversByGroup.set(assignment.group, []);
    }
    driversByGroup.get(assignment.group)!.push({
      id: assignment.driver.id,
      fullName: assignment.driver.fullName,
    });
  }

  const preliminarySessions = await db.session.findMany({
    where: {
      roundId,
      group: { in: groupLabels },
      type: { in: [...PRELIMINARY_SESSION_TYPES] },
    },
    select: {
      group: true,
      type: true,
      results: {
        select: {
          driverId: true,
          position: true,
          points: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  type PreliminarySession = (typeof preliminarySessions)[number];
  const sessionsByGroup = new Map<string, PreliminarySession[]>();
  for (const session of preliminarySessions) {
    if (!session.group) continue;
    if (!sessionsByGroup.has(session.group)) {
      sessionsByGroup.set(session.group, []);
    }
    sessionsByGroup.get(session.group)!.push(session);
  }

  const drivers: { id: string; fullName: string; group: string }[] = [];
  const groupsMissingResults: string[] = [];

  for (const group of groupLabels) {
    const groupSessions = sessionsByGroup.get(group) ?? [];
    if (
      groupSessions.length === 0 ||
      groupSessions.some((session) => session.results.length === 0)
    ) {
      groupsMissingResults.push(group);
      continue;
    }

    const groupDrivers = driversByGroup.get(group) ?? [];
    const scoreByDriver = new Map<
      string,
      { id: string; fullName: string; totalPoints: number; raceWins: number }
    >();

    for (const driver of groupDrivers) {
      scoreByDriver.set(driver.id, {
        id: driver.id,
        fullName: driver.fullName,
        totalPoints: 0,
        raceWins: 0,
      });
    }

    for (const session of groupSessions) {
      for (const result of session.results) {
        const entry = scoreByDriver.get(result.driverId);
        if (!entry) continue;
        entry.totalPoints += result.points;
        if (session.type === "RACE" && result.position === 1) {
          entry.raceWins += 1;
        }
      }
    }

    const qualified = Array.from(scoreByDriver.values())
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (b.raceWins !== a.raceWins) {
          return b.raceWins - a.raceWins;
        }
        return a.fullName.localeCompare(b.fullName);
      })
      .slice(0, TOP_PER_GROUP);

    for (const driver of qualified) {
      drivers.push({
        id: driver.id,
        fullName: driver.fullName,
        group,
      });
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
