import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const RACE_TYPES = ["RACE", "FINAL_RACE"];
const QUALIFYING_TYPES = ["QUALIFYING", "FINAL_QUALIFYING"];

function isRaceType(type: string): boolean {
  return RACE_TYPES.includes(type);
}
function isQualifyingType(type: string): boolean {
  return QUALIFYING_TYPES.includes(type);
}

function normalizePoints(value: number): number {
  return Math.round(value * 100) / 100;
}

function tieKey(totalPoints: number, wins: number): string {
  return `points:${normalizePoints(totalPoints)}|wins:${wins}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const championshipId = params.id;
    const { searchParams } = new URL(request.url);
    const roundIdFilter = searchParams.get("roundId") || null;

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const roundsWhere = roundIdFilter
      ? { championshipId, id: roundIdFilter }
      : { championshipId };
    const rounds = await db.round.findMany({
      where: roundsWhere,
      orderBy: { date: "asc" },
      select: { id: true, name: true, date: true },
    });

    const roundIds = rounds.map((r) => r.id);
    const roundMap = new Map(rounds.map((r) => [r.id, { name: r.name, date: r.date }]));

    if (roundIds.length === 0) {
      const allRounds = await db.round.findMany({
        where: { championshipId },
        orderBy: { date: "asc" },
        select: { id: true, name: true, date: true },
      });
      return NextResponse.json({
        championship: { id: championship.id, name: championship.name },
        rounds: allRounds.map((r) => ({ id: r.id, name: r.name, date: r.date })),
        standings: [],
        roundId: roundIdFilter,
      });
    }

    const results = await db.sessionResult.findMany({
      where: { session: { roundId: { in: roundIds } } },
      include: {
        driver: { select: { id: true, fullName: true } },
        session: { select: { roundId: true, type: true } },
      },
    });

    const adjustmentWhere = roundIdFilter
      ? { roundId: roundIdFilter }
      : { championshipId, roundId: null };
    const adjustments = await db.driverPointAdjustment.findMany({
      where: adjustmentWhere,
      select: { driverId: true, delta: true },
    });
    const adjustmentByDriver = new Map<string, number>();
    for (const a of adjustments) {
      const cur = adjustmentByDriver.get(a.driverId) ?? 0;
      adjustmentByDriver.set(a.driverId, cur + a.delta);
    }

    const driverMap = new Map<
      string,
      {
        driverId: string;
        fullName: string;
        basePoints: number;
        wins: number;
        podiums: number;
        poles: number;
        pointsByRound: { roundId: string; roundName: string; points: number }[];
      }
    >();

    for (const result of results) {
      const driverId = result.driverId;
      const roundId = result.session.roundId;
      const sessionType = result.session.type;
      const roundInfo = roundMap.get(roundId);
      const roundName = roundInfo ? roundInfo.name : "Unknown";

      if (!driverMap.has(driverId)) {
        driverMap.set(driverId, {
          driverId: result.driver.id,
          fullName: result.driver.fullName,
          basePoints: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          pointsByRound: [],
        });
      }

      const entry = driverMap.get(driverId)!;
      entry.basePoints += result.points;

      if (isRaceType(sessionType)) {
        if (result.position === 1) entry.wins += 1;
        if (result.position >= 1 && result.position <= 3) entry.podiums += 1;
      }
      if (isQualifyingType(sessionType) && result.position === 1) {
        entry.poles += 1;
      }

      const roundEntry = entry.pointsByRound.find((r) => r.roundId === roundId);
      if (roundEntry) {
        roundEntry.points += result.points;
      } else {
        entry.pointsByRound.push({ roundId, roundName, points: result.points });
      }
    }

    for (const [driverId] of adjustmentByDriver) {
      if (!driverMap.has(driverId)) {
        const driver = await db.driver.findUnique({
          where: { id: driverId },
          select: { id: true, fullName: true },
        });
        if (driver) {
          driverMap.set(driverId, {
            driverId: driver.id,
            fullName: driver.fullName,
            basePoints: 0,
            wins: 0,
            podiums: 0,
            poles: 0,
            pointsByRound: [],
          });
        }
      }
    }

    const allRounds = await db.round.findMany({
      where: { championshipId },
      orderBy: { date: "asc" },
      select: { id: true, name: true, date: true },
    });

    let overridesByTieKey = new Map<string, Map<string, number>>();
    if (!roundIdFilter) {
      const overrides = await db.standingsOverride.findMany({
        where: { championshipId },
        select: { driverId: true, tieKey: true, orderIndex: true },
      });
      for (const o of overrides) {
        if (!overridesByTieKey.has(o.tieKey)) {
          overridesByTieKey.set(o.tieKey, new Map());
        }
        overridesByTieKey.get(o.tieKey)!.set(o.driverId, o.orderIndex);
      }
    }

    const entries = Array.from(driverMap.values()).map((entry) => {
      const adjustmentsSum = adjustmentByDriver.get(entry.driverId) ?? 0;
      const totalPoints = entry.basePoints + adjustmentsSum;
      return {
        ...entry,
        totalPoints,
        adjustments: adjustmentsSum,
        pointsByRound: entry.pointsByRound.sort((a, b) => {
          const indexA = rounds.findIndex((r) => r.id === a.roundId);
          const indexB = rounds.findIndex((r) => r.id === b.roundId);
          return indexA - indexB;
        }),
      };
    });

    const sortedByPointsWins = [...entries].sort((a, b) => {
      const ptsA = normalizePoints(a.totalPoints);
      const ptsB = normalizePoints(b.totalPoints);
      if (ptsB !== ptsA) return ptsB - ptsA;
      return b.wins - a.wins;
    });

    const groups: typeof entries[] = [];
    let currentGroup: typeof entries = [];
    let lastKey = "";

    for (const e of sortedByPointsWins) {
      const key = tieKey(e.totalPoints, e.wins);
      if (key !== lastKey && currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      lastKey = key;
      currentGroup.push(e);
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    const standings: typeof entries = [];
    for (const group of groups) {
      const key = tieKey(group[0].totalPoints, group[0].wins);
      const overrideMap = overridesByTieKey.get(key);
      const sorted = [...group].sort((a, b) => {
        if (overrideMap) {
          const idxA = overrideMap.get(a.driverId) ?? 999;
          const idxB = overrideMap.get(b.driverId) ?? 999;
          if (idxA !== idxB) return idxA - idxB;
        }
        return a.fullName.localeCompare(b.fullName);
      });
      standings.push(...sorted);
    }

    const standingsWithFlags = standings.map((s) => {
      const key = tieKey(s.totalPoints, s.wins);
      const group = groups.find(
        (g) => g.length > 0 && tieKey(g[0].totalPoints, g[0].wins) === key
      );
      const canReorder = !roundIdFilter && group && group.length >= 2;
      return {
        ...s,
        canReorder: !!canReorder,
        tieKey: key,
      };
    });

    return NextResponse.json({
      championship: { id: championship.id, name: championship.name },
      rounds: allRounds.map((r) => ({ id: r.id, name: r.name, date: r.date })),
      standings: standingsWithFlags,
      roundId: roundIdFilter,
    });
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
