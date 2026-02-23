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

    const round = await db.round.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        date: true,
        track: { select: { name: true, location: true } },
        roundImages: { select: { id: true, imageUrl: true } },
      },
    });

    if (!round) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const roundIds = [round.id];
    const results = await db.sessionResult.findMany({
      where: { session: { roundId: { in: roundIds } } },
      select: {
        driverId: true,
        position: true,
        points: true,
        sessionId: true,
      },
    });
    const driverPoints = new Map<string, number>();
    const driverPositions = new Map<string, number>();
    for (const r of results) {
      const cur = driverPoints.get(r.driverId) ?? 0;
      driverPoints.set(r.driverId, cur + r.points);
      driverPositions.set(r.driverId, Math.min(driverPositions.get(r.driverId) ?? 999, r.position));
    }
    const driverIds = Array.from(driverPoints.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([driverId]) => driverId);
    let roundStandings: { fullName: string; totalPoints: number }[] = [];
    if (driverIds.length > 0) {
      const drivers = await db.driver.findMany({
        where: { id: { in: driverIds } },
        select: { id: true, fullName: true },
      });
      const nameMap = new Map(drivers.map((d) => [d.id, d.fullName]));
      roundStandings = driverIds.map((driverId) => ({
        fullName: nameMap.get(driverId) ?? "—",
        totalPoints: driverPoints.get(driverId) ?? 0,
      }));
    }

    return NextResponse.json({
      round: {
        id: round.id,
        name: round.name,
        date: round.date.toISOString(),
        trackName: round.track?.name ?? null,
        location: round.track?.location ?? null,
      },
      roundStandings,
      images: round.roundImages.map((img) => ({ url: img.imageUrl })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch round" },
      { status: 500 }
    );
  }
}
