import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const championshipId = params.id;

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    // Get all rounds for this championship
    const rounds = await db.round.findMany({
      where: { championshipId },
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        date: true,
      },
    });

    const roundIds = rounds.map((r) => r.id);
    const roundMap = new Map(rounds.map((r) => [r.id, { name: r.name, date: r.date }]));

    if (roundIds.length === 0) {
      return NextResponse.json({
        championship: {
          id: championship.id,
          name: championship.name,
        },
        rounds: [],
        standings: [],
      });
    }

    // Get all session results for sessions in these rounds, with driver and session.round
    const results = await db.sessionResult.findMany({
      where: {
        session: {
          roundId: { in: roundIds },
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            fullName: true,
          },
        },
        session: {
          select: {
            roundId: true,
          },
        },
      },
    });

    // Aggregate: by driver -> totalPoints, pointsByRound
    const driverMap = new Map<
      string,
      {
        driverId: string;
        fullName: string;
        totalPoints: number;
        pointsByRound: { roundId: string; roundName: string; points: number }[];
      }
    >();

    for (const result of results) {
      const driverId = result.driverId;
      const roundId = result.session.roundId;
      const roundInfo = roundMap.get(roundId);
      const roundName = roundInfo ? roundInfo.name : "Unknown";
      const points = result.points;

      if (!driverMap.has(driverId)) {
        driverMap.set(driverId, {
          driverId: result.driver.id,
          fullName: result.driver.fullName,
          totalPoints: 0,
          pointsByRound: [],
        });
      }

      const entry = driverMap.get(driverId)!;
      entry.totalPoints += points;

      const roundEntry = entry.pointsByRound.find((r) => r.roundId === roundId);
      if (roundEntry) {
        roundEntry.points += points;
      } else {
        entry.pointsByRound.push({ roundId, roundName, points });
      }
    }

    // Sort pointsByRound by round order; include only drivers who have results in this championship
    const standings = Array.from(driverMap.values())
      .map((entry) => ({
        ...entry,
        pointsByRound: entry.pointsByRound.sort((a, b) => {
          const indexA = rounds.findIndex((r) => r.id === a.roundId);
          const indexB = rounds.findIndex((r) => r.id === b.roundId);
          return indexA - indexB;
        }),
      }))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return a.fullName.localeCompare(b.fullName);
      });

    return NextResponse.json({
      championship: {
        id: championship.id,
        name: championship.name,
      },
      rounds: rounds.map((r) => ({
        id: r.id,
        name: r.name,
        date: r.date,
      })),
      standings,
    });
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
