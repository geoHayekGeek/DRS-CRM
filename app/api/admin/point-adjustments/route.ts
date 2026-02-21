import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, championshipId, roundId, delta } = body;

    if (!driverId || typeof driverId !== "string") {
      return NextResponse.json(
        { error: "driverId is required" },
        { status: 400 }
      );
    }

    if (delta !== 1 && delta !== -1) {
      return NextResponse.json(
        { error: "delta must be 1 (bonus) or -1 (penalty)" },
        { status: 400 }
      );
    }

    const hasChampionship = championshipId && typeof championshipId === "string";
    const hasRound = roundId && typeof roundId === "string";

    if (!hasChampionship && !hasRound) {
      return NextResponse.json(
        { error: "Either championshipId or roundId is required" },
        { status: 400 }
      );
    }

    if (hasChampionship && hasRound) {
      return NextResponse.json(
        { error: "Provide only championshipId (championship-level) or roundId (round-level), not both" },
        { status: 400 }
      );
    }

    const driver = await db.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (hasRound) {
      const round = await db.round.findUnique({
        where: { id: roundId },
      });
      if (!round) {
        return NextResponse.json({ error: "Round not found" }, { status: 404 });
      }
    }

    if (hasChampionship) {
      const championship = await db.championship.findUnique({
        where: { id: championshipId },
      });
      if (!championship) {
        return NextResponse.json(
          { error: "Championship not found" },
          { status: 404 }
        );
      }
    }

    const adjustment = await db.driverPointAdjustment.create({
      data: {
        driverId,
        championshipId: hasChampionship ? championshipId : null,
        roundId: hasRound ? roundId : null,
        delta,
      },
    });

    return NextResponse.json(adjustment, { status: 201 });
  } catch (error) {
    console.error("Error creating point adjustment:", error);
    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}
