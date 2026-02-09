import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST: Assign all existing drivers to this championship.
 * Only allowed when championship.isCurrent is true (manual admin action).
 */
export async function POST(
  _request: NextRequest,
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

    if (!championship.isCurrent) {
      return NextResponse.json(
        { error: "Assign all drivers is only available for the current championship" },
        { status: 400 }
      );
    }

    const allDrivers = await db.driver.findMany({
      select: { id: true },
    });

    const existing = await db.championshipDriver.findMany({
      where: { championshipId },
      select: { driverId: true },
    });
    const existingDriverIds = new Set(existing.map((e) => e.driverId));
    const toAdd = allDrivers.filter((d) => !existingDriverIds.has(d.id));

    if (toAdd.length === 0) {
      return NextResponse.json(
        { message: "All drivers are already assigned", added: 0 },
        { status: 200 }
      );
    }

    await db.championshipDriver.createMany({
      data: toAdd.map((d) => ({ championshipId, driverId: d.id })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { success: true, added: toAdd.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning all drivers:", error);
    return NextResponse.json(
      { error: "Failed to assign all drivers" },
      { status: 500 }
    );
  }
}
