import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const championships = await db.championship.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
      },
    });

    if (championships.length === 0) {
      return NextResponse.json({
        championship: null,
        hasStandings: false,
      });
    }

    const resultsWithChampionship = await db.sessionResult.findMany({
      where: {
        session: {
          round: { championshipId: { not: null } },
        },
      },
      select: {
        points: true,
        driverId: true,
        session: {
          select: {
            round: { select: { championshipId: true } },
          },
        },
      },
    });

    const championshipIdsWithStandings = new Set<string>();
    for (const r of resultsWithChampionship) {
      const cid = r.session.round.championshipId;
      if (cid) championshipIdsWithStandings.add(cid);
    }

    const featured =
      championships.find(
        (c) => c.isCurrent && championshipIdsWithStandings.has(c.id)
      ) ??
      championships.find((c) => championshipIdsWithStandings.has(c.id)) ??
      championships[0] ??
      null;

    if (!featured) {
      return NextResponse.json({
        championship: null,
        hasStandings: false,
      });
    }

    const hasStandings = championshipIdsWithStandings.has(featured.id);

    const response: {
      championship: {
        id: string;
        name: string;
        startDate: string;
        endDate: string | null;
      } | null;
      hasStandings: boolean;
      standings?: { fullName: string; totalPoints: number; roundsPlayed: number }[];
    } = {
      championship: {
        id: featured.id,
        name: featured.name,
        startDate: featured.startDate.toISOString(),
        endDate: featured.endDate?.toISOString() ?? null,
      },
      hasStandings,
    };

    if (hasStandings) {
      const rounds = await db.round.findMany({
        where: { championshipId: featured.id },
        select: { id: true },
      });
      const roundIds = rounds.map((r) => r.id);
      if (roundIds.length > 0) {
        const results = await db.sessionResult.findMany({
          where: { session: { roundId: { in: roundIds } } },
          select: {
            driverId: true,
            points: true,
            session: { select: { roundId: true } },
          },
        });
        const driverPoints = new Map<string, number>();
        const driverRoundIds = new Map<string, Set<string>>();
        for (const r of results) {
          driverPoints.set(r.driverId, (driverPoints.get(r.driverId) ?? 0) + r.points);
          if (!driverRoundIds.has(r.driverId)) driverRoundIds.set(r.driverId, new Set());
          driverRoundIds.get(r.driverId)!.add(r.session.roundId);
        }
        const top5 = Array.from(driverPoints.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([driverId]) => driverId);

        if (top5.length > 0) {
          const drivers = await db.driver.findMany({
            where: { id: { in: top5 } },
            select: { id: true, fullName: true },
          });
          const nameMap = new Map(drivers.map((d) => [d.id, d.fullName]));
          response.standings = top5.map((driverId) => {
            const roundIdsWithResults = driverRoundIds.get(driverId) ?? new Set<string>();
            const roundsPlayed = roundIdsWithResults.size;
            return {
              fullName: nameMap.get(driverId) ?? "—",
              totalPoints: driverPoints.get(driverId) ?? 0,
              roundsPlayed,
            };
          });
        } else {
          response.standings = [];
        }
      } else {
        response.standings = [];
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch featured championship" },
      { status: 500 }
    );
  }
}
