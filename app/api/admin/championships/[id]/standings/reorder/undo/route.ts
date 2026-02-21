import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const championshipId = params.id;
    const body = await request.json();
    const { tieKey: tieKeyParam } = body;

    if (!tieKeyParam || typeof tieKeyParam !== "string") {
      return NextResponse.json(
        { error: "tieKey is required" },
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

    await db.standingsOverride.deleteMany({
      where: { championshipId, tieKey: tieKeyParam },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error undoing standings reorder:", error);
    return NextResponse.json(
      { error: "Failed to undo reorder" },
      { status: 500 }
    );
  }
}
