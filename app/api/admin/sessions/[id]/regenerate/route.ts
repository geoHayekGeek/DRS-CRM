import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFinalQualifyingDrivers } from "@/lib/final-qualifying";

/**
 * POST: Regenerate Final Qualifying drivers from qualifying results.
 * Clears existing results, recalculates top 3 per group.
 * Only for FINAL_QUALIFYING sessions with group=null.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { results: { select: { id: true } } },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (
      session.type !== "FINAL_QUALIFYING" ||
      session.group !== null
    ) {
      return NextResponse.json(
        { error: "Regenerate is only for Final Qualifying sessions" },
        { status: 400 }
      );
    }

    const fqCheck = await getFinalQualifyingDrivers(session.roundId);

    if (!fqCheck.ready) {
      await db.session.update({
        where: { id: sessionId },
        data: {
          status: "PENDING",
        },
      });
      return NextResponse.json({
        success: true,
        status: "PENDING",
        message: "Qualifying incomplete. Status set to PENDING.",
      });
    }

    await db.$transaction([
      db.sessionResult.deleteMany({ where: { sessionId } }),
      db.session.update({
        where: { id: sessionId },
        data: { status: "READY" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      status: "READY",
      driverCount: fqCheck.drivers.length,
      message: "Final Qualifying drivers recalculated.",
    });
  } catch (error) {
    console.error("Error regenerating Final Qualifying:", error);
    return NextResponse.json(
      { error: "Failed to regenerate" },
      { status: 500 }
    );
  }
}
