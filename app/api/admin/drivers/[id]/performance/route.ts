import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;

    const driver = await db.driver.findUnique({
      where: { id: driverId },
      select: {
        id: true,
        fullName: true,
        profileImageUrl: true,
        weight: true,
        height: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    const results = await db.sessionResult.findMany({
      where: { driverId },
      select: {
        position: true,
        points: true,
        session: {
          select: {
            id: true,
            type: true,
            group: true,
            order: true,
            pointsMultiplier: true,
            round: {
              select: {
                id: true,
                name: true,
                date: true,
                track: { select: { name: true } },
                championshipId: true,
                championship: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    const championshipIds = [
      ...new Set(
        results
          .map((r) => r.session.round.championshipId)
          .filter((id): id is string => id != null)
      ),
    ];

    let positionByChampionship: Map<string, number> = new Map();
    if (championshipIds.length > 0) {
      const allResultsInChampionships = await db.sessionResult.findMany({
        where: {
          session: {
            round: { championshipId: { in: championshipIds } },
          },
        },
        select: {
          driverId: true,
          points: true,
          session: {
            select: { round: { select: { championshipId: true } } },
          },
        },
      });

      const pointsByChampionshipAndDriver = new Map<
        string,
        Map<string, number>
      >();
      for (const row of allResultsInChampionships) {
        const cid = row.session.round.championshipId;
        if (!cid) continue;
        if (!pointsByChampionshipAndDriver.has(cid)) {
          pointsByChampionshipAndDriver.set(cid, new Map());
        }
        const driverMap = pointsByChampionshipAndDriver.get(cid)!;
        const current = driverMap.get(row.driverId) ?? 0;
        driverMap.set(row.driverId, current + row.points);
      }

      for (const cid of championshipIds) {
        const driverTotals = pointsByChampionshipAndDriver.get(cid);
        if (!driverTotals) continue;
        const sorted = Array.from(driverTotals.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([did]) => did);
        const pos = sorted.indexOf(driverId);
        if (pos !== -1) {
          positionByChampionship.set(cid, pos + 1);
        }
      }
    }

    type RoundEntry = {
      roundId: string;
      roundName: string;
      trackName: string;
      roundPoints: number;
      sessions: {
        sessionId: string;
        sessionType: string;
        group: string | null;
        position: number;
        points: number;
        multiplier: string | null;
      }[];
    };

    const roundMap = new Map<string, RoundEntry>();
    const championshipMap = new Map<
      string,
      {
        championshipId: string;
        championshipName: string;
        totalPoints: number;
        positionInChampionship: number | null;
        rounds: RoundEntry[];
      }
    >();

    const sortedResults = [...results].sort((a, b) => {
      const dateA = a.session.round.date.getTime();
      const dateB = b.session.round.date.getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.session.order - b.session.order;
    });

    for (const r of sortedResults) {
      const round = r.session.round;
      const c = round.championship;
      const championshipId = c?.id ?? "none";
      const championshipName = c?.name ?? "—";
      const roundId = round.id;
      const roundName = round.name;
      const trackName = round.track.name;
      const sessionType = r.session.type;
      const group = r.session.group;
      const position = r.position;
      const points = r.points;
      const multiplier =
        r.session.pointsMultiplier != null
          ? String(r.session.pointsMultiplier)
          : null;

      if (!roundMap.has(roundId)) {
        roundMap.set(roundId, {
          roundId,
          roundName,
          trackName,
          roundPoints: 0,
          sessions: [],
        });
      }
      const roundEntry = roundMap.get(roundId)!;
      roundEntry.roundPoints += points;
      roundEntry.sessions.push({
        sessionId: r.session.id,
        sessionType,
        group,
        position,
        points,
        multiplier,
      });

      if (!championshipMap.has(championshipId)) {
        championshipMap.set(championshipId, {
          championshipId: championshipId === "none" ? "" : championshipId,
          championshipName,
          totalPoints: 0,
          positionInChampionship:
            championshipId !== "none"
              ? positionByChampionship.get(championshipId) ?? null
              : null,
          rounds: [],
        });
      }
      const champEntry = championshipMap.get(championshipId)!;
      champEntry.totalPoints += points;
    }

    const roundIdToChampionship = new Map<string, string>();
    for (const r of results) {
      const cid = r.session.round.championship?.id ?? "none";
      roundIdToChampionship.set(r.session.round.id, cid);
    }

    const roundOrderByChampionship = new Map<
      string,
      { date: Date; roundId: string }[]
    >();
    for (const r of results) {
      const cid = r.session.round.championshipId ?? "none";
      const round = r.session.round;
      if (!roundOrderByChampionship.has(cid)) {
        roundOrderByChampionship.set(cid, []);
      }
      const arr = roundOrderByChampionship.get(cid)!;
      if (!arr.some((x) => x.roundId === round.id)) {
        arr.push({ date: round.date, roundId: round.id });
      }
    }
    for (const arr of roundOrderByChampionship.values()) {
      arr.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    const championships = Array.from(championshipMap.entries()).map(
      ([cid, entry]) => {
        const roundOrder = roundOrderByChampionship.get(cid) ?? [];
        const rounds = roundOrder
          .map(({ roundId }) => roundMap.get(roundId))
          .filter((r): r is NonNullable<typeof r> => r != null);
        return {
          championshipId: entry.championshipId,
          championshipName: entry.championshipName,
          totalPoints: entry.totalPoints,
          roundsParticipated: rounds.length,
          positionInChampionship: entry.positionInChampionship,
          rounds,
        };
      }
    );

    championships.sort((a, b) => {
      const aName = a.championshipName;
      const bName = b.championshipName;
      return aName.localeCompare(bName);
    });

    return NextResponse.json({
      driver: {
        id: driver.id,
        fullName: driver.fullName,
        profileImageUrl: driver.profileImageUrl,
        weight: driver.weight,
        height: driver.height,
        notes: driver.notes,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      },
      championships,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch driver performance" },
      { status: 500 }
    );
  }
}
