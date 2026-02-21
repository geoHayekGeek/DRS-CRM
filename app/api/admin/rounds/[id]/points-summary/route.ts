import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roundId = params.id;

    const round = await db.round.findUnique({
      where: { id: roundId },
      select: { id: true, name: true },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const results = await db.sessionResult.findMany({
      where: {
        session: { roundId },
      },
      include: {
        driver: { select: { id: true, fullName: true } },
      },
    });

    const byDriver = new Map<string, { driverName: string; totalPoints: number }>();
    for (const r of results) {
      const existing = byDriver.get(r.driverId);
      if (existing) {
        existing.totalPoints += r.points;
      } else {
        byDriver.set(r.driverId, {
          driverName: r.driver.fullName,
          totalPoints: r.points,
        });
      }
    }

    const items = Array.from(byDriver.entries())
      .map(([driverId, { driverName, totalPoints }]) => ({
        driverId,
        driverName,
        totalPoints,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((row, index) => ({
        position: index + 1,
        driverName: row.driverName,
        totalPoints: row.totalPoints,
      }));

    return NextResponse.json({
      roundName: round.name,
      items,
    });
  } catch (error) {
    console.error("Error fetching points summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch points summary" },
      { status: 500 }
    );
  }
}
