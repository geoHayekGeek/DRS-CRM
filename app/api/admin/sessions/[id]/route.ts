import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        round: {
          include: {
            track: true,
            championship: true,
          },
        },
        results: {
          include: {
            driver: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get eligible drivers for this session
    let eligibleDrivers: any[] = [];

    if (session.group) {
      // Group session: get drivers in this group
      const groupAssignments = await db.groupAssignment.findMany({
        where: {
          roundId: session.roundId,
          group: session.group,
        },
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          kartNumber: "asc",
        },
      });

      eligibleDrivers = groupAssignments.map((assignment) => ({
        id: assignment.driver.id,
        fullName: assignment.driver.fullName,
        group: assignment.group,
        kartNumber: assignment.kartNumber,
      }));
    } else {
      // Final session: get all drivers in the round
      const groupAssignments = await db.groupAssignment.findMany({
        where: {
          roundId: session.roundId,
        },
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          kartNumber: "asc",
        },
      });

      eligibleDrivers = groupAssignments.map((assignment) => ({
        id: assignment.driver.id,
        fullName: assignment.driver.fullName,
        group: assignment.group,
        kartNumber: assignment.kartNumber,
      }));
    }

    // Map existing results by driverId for easy lookup
    const resultsByDriverId = new Map(
      session.results.map((result) => [
        result.driverId,
        {
          position: result.position,
          points: result.points,
        },
      ])
    );

    // Combine drivers with their results
    const driversWithResults = eligibleDrivers.map((driver) => ({
      ...driver,
      result: resultsByDriverId.get(driver.id) || null,
    }));

    return NextResponse.json({
      session: {
        id: session.id,
        type: session.type,
        group: session.group,
        order: session.order,
        pointsMultiplier: session.pointsMultiplier,
      },
      round: {
        id: session.round.id,
        name: session.round.name,
        date: session.round.date,
        track: session.round.track,
        championship: session.round.championship,
      },
      drivers: driversWithResults,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
