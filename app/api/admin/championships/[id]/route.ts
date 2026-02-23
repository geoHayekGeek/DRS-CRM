import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRoundStatus } from "@/lib/round-status";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [championship, rounds] = await Promise.all([
      db.championship.findUnique({
        where: { id: params.id },
      }),
      db.round.findMany({
        where: { championshipId: params.id },
        orderBy: { date: "desc" },
        include: {
          sessions: {
            select: {
              type: true,
              group: true,
              status: true,
              results: { select: { id: true } },
            },
            orderBy: { order: "asc" },
          },
          _count: { select: { roundDrivers: true } },
        },
      }),
    ]);

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const isLegacyGroupFinal = (s: { type: string; group: string | null }) =>
      (s.type === "FINAL_QUALIFYING" || s.type === "FINAL_RACE") && s.group !== null;
    const isSessionComplete = (
      s: { status: string; results: { id: string }[] }
    ) => s.status === "COMPLETED" || s.results.length > 0;

    const roundsWithStatus = rounds.map((r) => {
      const relevantSessions = r.sessions.filter((s) => !isLegacyGroupFinal(s));
      const allSessionsComplete =
        relevantSessions.length > 0 &&
        relevantSessions.every((s) => isSessionComplete(s));
      const roundStatus = getRoundStatus({
        date: r.date,
        numberOfGroups: r.numberOfGroups ?? 0,
        setupCompleted: r.setupCompleted ?? false,
        driverCount: r._count?.roundDrivers ?? 0,
        allSessionsComplete,
      });
      const { sessions, _count, ...rest } = r;
      return { ...rest, roundStatus };
    });

    return NextResponse.json({
      ...championship,
      rounds: roundsWithStatus,
    });
  } catch (error) {
    console.error("Error fetching championship:", error);
    return NextResponse.json(
      { error: "Failed to fetch championship" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, isCurrent, startDate, endDate } = body;

    const existingChampionship = await db.championship.findUnique({
      where: { id: params.id },
    });

    if (!existingChampionship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Championship name is required" },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid start date format" },
        { status: 400 }
      );
    }

    let end: Date | null = null;
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date format" },
          { status: 400 }
        );
      }
      if (end < start) {
        return NextResponse.json(
          { error: "End date must be after or equal to start date" },
          { status: 400 }
        );
      }
    }

    const isCurrentBool = typeof isCurrent === "boolean" ? isCurrent : false;

    const championship = await db.championship.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        isCurrent: isCurrentBool,
        startDate: start,
        endDate: end,
      },
    });

    return NextResponse.json(championship);
  } catch (error) {
    console.error("Error updating championship:", error);
    return NextResponse.json(
      { error: "Failed to update championship" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingChampionship = await db.championship.findUnique({
      where: { id: params.id },
    });

    if (!existingChampionship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    await db.championship.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting championship:", error);
    return NextResponse.json(
      { error: "Failed to delete championship" },
      { status: 500 }
    );
  }
}
