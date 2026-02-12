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
      standings?: { fullName: string; totalPoints: number }[];
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
        const driverPoints = await db.sessionResult.groupBy({
          by: ["driverId"],
          where: {
            session: { roundId: { in: roundIds } },
          },
          _sum: { points: true },
        });
        const top5 = driverPoints
          .map((d) => ({
            driverId: d.driverId,
            totalPoints: d._sum.points ?? 0,
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, 5);

        if (top5.length > 0) {
          const drivers = await db.driver.findMany({
            where: { id: { in: top5.map((t) => t.driverId) } },
            select: { id: true, fullName: true },
          });
          const driverMap = new Map(drivers.map((d) => [d.id, d.fullName]));
          response.standings = top5.map((t) => ({
            fullName: driverMap.get(t.driverId) ?? "—",
            totalPoints: t.totalPoints,
          }));
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
