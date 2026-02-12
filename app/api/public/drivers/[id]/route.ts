import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
      sessionType: string;
      group: string | null;
      position: number;
      points: number;
      multiplier: string | null;
    };
    type RoundPublic = {
      roundName: string;
      trackName: string;
      roundPoints: number;
      sessions: SessionPublic[];
    };
    type ChampionshipPublic = {
      championshipName: string;
      totalPoints: number;
      positionInChampionship: number | null;
      rounds: RoundPublic[];
    };

    const roundMap = new Map<
      string,
      { roundName: string; trackName: string; roundPoints: number; sessions: SessionPublic[] }
    >();
    const championshipMap = new Map<
      string,
      {
        championshipName: string;
        totalPoints: number;
        positionInChampionship: number | null;
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
      const roundId = `${round.name}-${round.date.getTime()}`;
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
          roundName,
          trackName,
          roundPoints: 0,
          sessions: [],
        });
      }
      const roundEntry = roundMap.get(roundId)!;
      roundEntry.roundPoints += points;
      roundEntry.sessions.push({
        sessionType,
        group,
        position,
        points,
        multiplier,
      });

      if (!championshipMap.has(championshipId)) {
        championshipMap.set(championshipId, {
          championshipName,
          totalPoints: 0,
          positionInChampionship:
            championshipId !== "none"
              ? positionByChampionship.get(championshipId) ?? null
              : null,
          roundIds: [],
        });
      }
      const champEntry = championshipMap.get(championshipId)!;
      champEntry.totalPoints += points;
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
      const roundId = `${round.name}-${round.date.getTime()}`;
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

    const championships: ChampionshipPublic[] = Array.from(
      championshipMap.entries()
    ).map(([cid, entry]) => {
      const roundOrder = roundOrderByChampionship.get(cid) ?? [];
      const rounds: RoundPublic[] = roundOrder
        .map(({ roundId }) => roundMap.get(roundId))
        .filter((r): r is NonNullable<typeof r> => r != null);
      return {
        championshipName: entry.championshipName,
        totalPoints: entry.totalPoints,
        positionInChampionship: entry.positionInChampionship,
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
