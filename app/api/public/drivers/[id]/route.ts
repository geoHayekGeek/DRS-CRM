import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const RACE_TYPES = ["RACE", "FINAL_RACE"];
const QUALIFYING_TYPES = ["QUALIFYING", "FINAL_QUALIFYING"];

function isRaceType(type: string): boolean {
  return RACE_TYPES.includes(type);
}
function isQualifyingType(type: string): boolean {
  return QUALIFYING_TYPES.includes(type);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const driver = await db.driver.findUnique({
      where: { id },
      select: {
        fullName: true,
        profileImageUrl: true,
        weight: true,
        height: true,
        notes: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const results = await db.sessionResult.findMany({
      where: { driverId: id },
      select: {
        position: true,
        points: true,
        session: {
          select: {
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
                championship: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (results.length === 0) {
      return NextResponse.json({
        driver: {
          fullName: driver.fullName,
          profileImageUrl: driver.profileImageUrl,
          weight: driver.weight,
          height: driver.height,
          notes: driver.notes,
        },
        performance: {
          careerStats: { totalPoints: 0, wins: 0, podiums: 0, poles: 0 },
          championships: [],
        },
      });
    }

    const championshipIds = [
      ...new Set(
        results
          .map((r) => r.session.round.championshipId)
          .filter((cid): cid is string => cid != null)
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
        const pos = sorted.indexOf(id);
        if (pos !== -1) {
          positionByChampionship.set(cid, pos + 1);
        }
      }
    }

    type SessionPublic = {
      type: string;
      position: number;
      points: number;
    };
    type RoundPublic = {
      roundId: string;
      roundName: string;
      trackName: string;
      roundPoints: number;
      positionInRound: number | null;
      wins: number;
      podiums: number;
      poles: number;
      sessions: SessionPublic[];
    };
    type ChampionshipPublic = {
      championshipName: string;
      totalPoints: number;
      positionInChampionship: number | null;
      wins: number;
      podiums: number;
      poles: number;
      rounds: RoundPublic[];
    };

    const careerStats = {
      totalPoints: 0,
      wins: 0,
      podiums: 0,
      poles: 0,
    };

    const roundMap = new Map<
      string,
      {
        roundId: string;
        roundName: string;
        trackName: string;
        roundPoints: number;
        wins: number;
        podiums: number;
        poles: number;
        sessions: SessionPublic[];
      }
    >();
    const championshipMap = new Map<
      string,
      {
        championshipName: string;
        totalPoints: number;
        positionInChampionship: number | null;
        wins: number;
        podiums: number;
        poles: number;
        roundIds: string[];
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
      const championshipId = round.championshipId ?? "none";
      const championshipName = c?.name ?? "—";
      const roundId = round.id;
      const roundName = round.name;
      const trackName = round.track?.name ?? "—";
      const sessionType = r.session.type;
      const position = r.position;
      const points = r.points;

      if (!roundMap.has(roundId)) {
        roundMap.set(roundId, {
          roundId,
          roundName,
          trackName,
          roundPoints: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          sessions: [],
        });
      }
      const roundEntry = roundMap.get(roundId)!;
      roundEntry.roundPoints += points;
      roundEntry.sessions.push({
        type: sessionType,
        position,
        points,
      });

      // Wins and podiums: only from RACE sessions (not qualifying)
      if (isRaceType(sessionType)) {
        if (position === 1) {
          careerStats.wins += 1;
          roundEntry.wins += 1;
        }
        if (position >= 1 && position <= 3) {
          careerStats.podiums += 1;
          roundEntry.podiums += 1;
        }
      } else if (isQualifyingType(sessionType) && position === 1) {
        careerStats.polePositions += 1;
        roundEntry.polePositions += 1;
      }

      if (!championshipMap.has(championshipId)) {
        championshipMap.set(championshipId, {
          championshipName,
          totalPoints: 0,
          positionInChampionship:
            championshipId !== "none"
              ? positionByChampionship.get(championshipId) ?? null
              : null,
          wins: 0,
          podiums: 0,
          poles: 0,
          roundIds: [],
        });
      }
      const champEntry = championshipMap.get(championshipId)!;
      champEntry.totalPoints += points;
      careerStats.totalPoints += points;
      // Podiums: only from RACE sessions (not qualifying)
      if (isRaceType(sessionType)) {
        if (position === 1) champEntry.wins += 1;
        if (position >= 1 && position <= 3) champEntry.podiums += 1;
      } else if (isQualifyingType(sessionType) && position === 1) {
        champEntry.polePositions += 1;
      }
      if (!champEntry.roundIds.includes(roundId)) {
        champEntry.roundIds.push(roundId);
      }
    }

    const roundOrderByChampionship = new Map<
      string,
      { date: Date; roundId: string }[]
    >();
    for (const r of results) {
      const cid = r.session.round.championshipId ?? "none";
      const round = r.session.round;
      const roundId = round.id;
      if (!roundOrderByChampionship.has(cid)) {
        roundOrderByChampionship.set(cid, []);
      }
      const arr = roundOrderByChampionship.get(cid)!;
      if (!arr.some((x) => x.roundId === roundId)) {
        arr.push({ date: round.date, roundId });
      }
    }
    for (const arr of roundOrderByChampionship.values()) {
      arr.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    const roundIds = Array.from(roundMap.keys());
    let positionInRoundByRound = new Map<string, number>();
    if (roundIds.length > 0) {
      const roundResults = await db.sessionResult.findMany({
        where: {
          session: { roundId: { in: roundIds } },
        },
        select: {
          driverId: true,
          points: true,
          session: { select: { roundId: true } },
        },
      });
      const pointsByRoundAndDriver = new Map<
        string,
        Map<string, number>
      >();
      for (const row of roundResults) {
        const rid = row.session.roundId;
        if (!pointsByRoundAndDriver.has(rid)) {
          pointsByRoundAndDriver.set(rid, new Map());
        }
        const driverMap = pointsByRoundAndDriver.get(rid)!;
        const current = driverMap.get(row.driverId) ?? 0;
        driverMap.set(row.driverId, current + row.points);
      }
      for (const rid of roundIds) {
        const driverTotals = pointsByRoundAndDriver.get(rid);
        if (!driverTotals) continue;
        const sorted = Array.from(driverTotals.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([did]) => did);
        const pos = sorted.indexOf(id);
        if (pos !== -1) {
          positionInRoundByRound.set(rid, pos + 1);
        }
      }
    }

    const championships: ChampionshipPublic[] = Array.from(
      championshipMap.entries()
    ).map(([cid, entry]) => {
      const roundOrder = roundOrderByChampionship.get(cid) ?? [];
      const rounds: RoundPublic[] = roundOrder
        .map(({ roundId }) => {
          const r = roundMap.get(roundId);
          if (!r) return null;
          return {
            ...r,
            positionInRound: positionInRoundByRound.get(roundId) ?? null,
          };
        })
        .filter((r): r is RoundPublic => r != null);
      return {
        championshipName: entry.championshipName,
        totalPoints: entry.totalPoints,
        positionInChampionship: entry.positionInChampionship,
        wins: entry.wins,
        podiums: entry.podiums,
        poles: entry.poles,
        rounds,
      };
    });

    championships.sort((a, b) =>
      a.championshipName.localeCompare(b.championshipName)
    );

    return NextResponse.json({
      driver: {
        fullName: driver.fullName,
        profileImageUrl: driver.profileImageUrl,
        weight: driver.weight,
        height: driver.height,
        notes: driver.notes,
      },
      performance: {
        careerStats: {
          totalPoints: careerStats.totalPoints,
          wins: careerStats.wins,
          podiums: careerStats.podiums,
          poles: careerStats.polePositions,
        },
        championships,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch driver" },
      { status: 500 }
    );
  }
}
