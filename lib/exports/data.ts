import { db } from "@/lib/db";
import type { ExportSessionBlock, PointsTypeLabel, SessionTypeLabel } from "./types";

function sessionTypeToLabel(type: string): SessionTypeLabel {
  switch (type) {
    case "QUALIFYING":
      return "Qualifying";
    case "RACE":
      return "Race";
    case "FINAL_QUALIFYING":
      return "Final Qualifying";
    case "FINAL_RACE":
      return "Final Race";
    default:
      return type.replace(/_/g, " ") as SessionTypeLabel;
  }
}

function pointsMultiplierToLabel(mult: string | null): PointsTypeLabel | null {
  if (!mult) return null;
  switch (mult) {
    case "NORMAL":
      return "Normal";
    case "HALF":
      return "Half";
    case "DOUBLE":
      return "Double";
    default:
      return null;
  }
}

/**
 * Load session with round, track, championship, results (with driver).
 * Get kart numbers from GroupAssignment for this round.
 * Returns one ExportSessionBlock or null if session not found.
 * Results are ordered by position (P1 -> Pn).
 */
export async function loadSessionExportData(
  sessionId: string
): Promise<ExportSessionBlock | null> {
  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      round: {
        include: {
          track: true,
          championship: true,
        },
      },
      results: {
        include: {
          driver: { select: { id: true, fullName: true } },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!session || !session.round) return null;

  const roundId = session.roundId;
  const driverIds = session.results.map((r) => r.driverId);
  const assignments = await db.groupAssignment.findMany({
    where: { roundId, driverId: { in: driverIds } },
    select: { driverId: true, kartNumber: true },
  });
  const kartByDriver = new Map(assignments.map((a) => [a.driverId, a.kartNumber]));

  const championshipName = session.round.championship?.name ?? "—";
  const roundName = session.round.name;
  const trackName = session.round.track.name;
  const sessionType = sessionTypeToLabel(session.type);
  const group = session.group;
  const pointsType =
    session.type === "RACE" || session.type === "FINAL_RACE"
      ? pointsMultiplierToLabel(session.pointsMultiplier)
      : null;

  const results = session.results.map((r) => ({
    position: r.position,
    driverName: r.driver.fullName,
    kartNumber: kartByDriver.get(r.driverId) ?? 0,
    points: r.points,
  }));

  return {
    championshipName,
    roundName,
    trackName,
    sessionType,
    group,
    pointsType,
    results,
  };
}

/**
 * Load all sessions for a round that have results.
 * Returns array of ExportSessionBlock in session order.
 */
export async function loadRoundExportData(
  roundId: string
): Promise<ExportSessionBlock[]> {
  const round = await db.round.findUnique({
    where: { id: roundId },
    include: {
      track: true,
      championship: true,
      sessions: {
        include: {
          results: {
            include: {
              driver: { select: { id: true, fullName: true } },
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!round) return [];

  const isLegacyGroupFinal = (s: { type: string; group: string | null }) =>
    (s.type === "FINAL_QUALIFYING" || s.type === "FINAL_RACE") && s.group !== null;

  const sessionsWithResults = round.sessions.filter(
    (s) => s.results.length > 0 && !isLegacyGroupFinal(s)
  );
  if (sessionsWithResults.length === 0) return [];

  const allDriverIds = new Set<string>();
  for (const s of sessionsWithResults) {
    for (const r of s.results) {
      allDriverIds.add(r.driverId);
    }
  }

  const assignments = await db.groupAssignment.findMany({
    where: { roundId, driverId: { in: Array.from(allDriverIds) } },
    select: { driverId: true, kartNumber: true },
  });
  const kartByDriver = new Map(assignments.map((a) => [a.driverId, a.kartNumber]));

  const championshipName = round.championship?.name ?? "—";
  const roundName = round.name;
  const trackName = round.track.name;

  return sessionsWithResults.map((session) => {
    const sessionType = sessionTypeToLabel(session.type);
    const group = session.group;
    const pointsType =
      session.type === "RACE" || session.type === "FINAL_RACE"
        ? pointsMultiplierToLabel(session.pointsMultiplier)
        : null;
    const results = session.results.map((r) => ({
      position: r.position,
      driverName: r.driver.fullName,
      kartNumber: kartByDriver.get(r.driverId) ?? 0,
      points: r.points,
    }));
    return {
      championshipName,
      roundName,
      trackName,
      sessionType,
      group,
      pointsType,
      results,
    };
  });
}
