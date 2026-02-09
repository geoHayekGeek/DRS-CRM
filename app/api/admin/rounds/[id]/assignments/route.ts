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

    const assignments = await db.groupAssignment.findMany({
      where: { roundId },
      include: {
        driver: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [
        { group: "asc" },
        { kartNumber: "asc" },
      ],
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
