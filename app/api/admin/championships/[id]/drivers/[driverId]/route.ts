import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; driverId: string } }
) {
  try {
    const championshipId = params.id;
    const driverId = params.driverId;

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const deleted = await db.championshipDriver.deleteMany({
      where: {
        championshipId,
        driverId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Driver is not assigned to this championship" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error removing championship driver:", error);
    return NextResponse.json(
      { error: "Failed to remove championship driver" },
      { status: 500 }
    );
  }
}
