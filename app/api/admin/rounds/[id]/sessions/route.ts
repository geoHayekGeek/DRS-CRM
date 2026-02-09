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
    });

    if (!round) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    const sessions = await db.session.findMany({
      where: { roundId },
      include: {
        results: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const sessionsWithStatus = sessions.map((session) => ({
      id: session.id,
      type: session.type,
      group: session.group,
      order: session.order,
      pointsMultiplier: session.pointsMultiplier,
      hasResults: session.results.length > 0,
    }));

    return NextResponse.json(sessionsWithStatus);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
