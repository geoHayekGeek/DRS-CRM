import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const championshipId = params.id;
    const body = await request.json();
    const { tieKey: tieKeyParam, orderedDriverIds } = body;

    if (!tieKeyParam || typeof tieKeyParam !== "string") {
      return NextResponse.json(
        { error: "tieKey is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(orderedDriverIds) || orderedDriverIds.length === 0) {
      return NextResponse.json(
        { error: "orderedDriverIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });
    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const rounds = await db.round.findMany({
      where: { championshipId },
      select: { id: true },
    });
    const roundIds = rounds.map((r) => r.id);

    const results = await db.sessionResult.findMany({
      where: { session: { roundId: { in: roundIds } } },
      include: {
        session: { select: { type: true } },
      },
    });

    const RACE_TYPES = ["RACE", "FINAL_RACE"];
    const driverStats = new Map<
      string,
      { totalPoints: number; wins: number; basePoints: number }
    >();

    const adjustmentByDriver = new Map<string, number>();
    const adjustments = await db.driverPointAdjustment.findMany({
      where: { championshipId, roundId: null },
      select: { driverId: true, delta: true },
    });
    for (const a of adjustments) {
      const cur = adjustmentByDriver.get(a.driverId) ?? 0;
      adjustmentByDriver.set(a.driverId, cur + a.delta);
    }

    for (const r of results) {
      const id = r.driverId;
      if (!driverStats.has(id)) {
        driverStats.set(id, { totalPoints: 0, wins: 0, basePoints: 0 });
      }
      const s = driverStats.get(id)!;
      s.basePoints += r.points;
      if (RACE_TYPES.includes(r.session.type) && r.position === 1) {
        s.wins += 1;
      }
    }

    for (const [driverId, s] of driverStats) {
      const adj = adjustmentByDriver.get(driverId) ?? 0;
      s.totalPoints = s.basePoints + adj;
    }

    const normalizePoints = (v: number) => Math.round(v * 100) / 100;
    const expectedKey = (points: number, wins: number) =>
      `points:${normalizePoints(points)}|wins:${wins}`;

    const firstDriverId = orderedDriverIds[0];
    const firstStats = driverStats.get(firstDriverId);
    if (!firstStats) {
      return NextResponse.json(
        { error: "Driver not found in championship standings" },
        { status: 400 }
      );
    }

    const expectedTieKey = expectedKey(
      firstStats.totalPoints,
      firstStats.wins
    );
    if (expectedTieKey !== tieKeyParam) {
      return NextResponse.json(
        { error: "tieKey does not match driver standings" },
        { status: 400 }
      );
    }

    for (const driverId of orderedDriverIds) {
      const stats = driverStats.get(driverId);
      if (!stats) {
        return NextResponse.json(
          { error: `Driver ${driverId} not found in championship` },
          { status: 400 }
        );
      }
      const key = expectedKey(
        stats.totalPoints,
        stats.wins
      );
      if (key !== tieKeyParam) {
        return NextResponse.json(
          { error: "All drivers must have the same points and wins" },
          { status: 400 }
        );
      }
    }

    await db.$transaction(async (tx) => {
      await tx.standingsOverride.deleteMany({
        where: { championshipId, tieKey: tieKeyParam },
      });

      await tx.standingsOverride.createMany({
        data: orderedDriverIds.map((driverId: string, index: number) => ({
          championshipId,
          driverId,
          tieKey: tieKeyParam,
          orderIndex: index,
        })),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering standings:", error);
    return NextResponse.json(
      { error: "Failed to reorder standings" },
      { status: 500 }
    );
  }
}
