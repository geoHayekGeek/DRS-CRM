import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateSessionPoints,
  SessionType,
  PointsMultiplier,
} from "@/lib/points";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const { pointsMultiplier, results } = body;

    // Fetch session with round info
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        round: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get eligible drivers for this session
    let eligibleDriverIds: string[] = [];

    if (session.group) {
      const groupAssignments = await db.groupAssignment.findMany({
        where: {
          roundId: session.roundId,
          group: session.group,
        },
        select: {
          driverId: true,
        },
      });
      eligibleDriverIds = groupAssignments.map((a) => a.driverId);
    } else {
      const groupAssignments = await db.groupAssignment.findMany({
        where: {
          roundId: session.roundId,
        },
        select: {
          driverId: true,
        },
      });
      eligibleDriverIds = groupAssignments.map((a) => a.driverId);
    }

    // Validate: submission must include ALL eligible drivers
    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: "Results array is required" },
        { status: 400 }
      );
    }

    const submittedDriverIds = results.map((r: any) => r.driverId);
    const missingDrivers = eligibleDriverIds.filter(
      (id) => !submittedDriverIds.includes(id)
    );
    const extraDrivers = submittedDriverIds.filter(
      (id) => !eligibleDriverIds.includes(id)
    );

    if (missingDrivers.length > 0) {
      return NextResponse.json(
        {
          error: `Missing drivers in submission. All ${eligibleDriverIds.length} eligible drivers must be included.`,
        },
        { status: 400 }
      );
    }

    if (extraDrivers.length > 0) {
      return NextResponse.json(
        { error: "Invalid drivers in submission" },
        { status: 400 }
      );
    }

    // Validate positions
    const positions = results.map((r: any) => r.position);
    const uniquePositions = new Set(positions);

    if (positions.length !== uniquePositions.size) {
      return NextResponse.json(
        { error: "Duplicate positions are not allowed" },
        { status: 400 }
      );
    }

    if (positions.some((p: number) => p < 1 || p > positions.length)) {
      return NextResponse.json(
        { error: "Positions must be between 1 and the number of drivers" },
        { status: 400 }
      );
    }

    // Validate multiplier for race sessions
    const isRaceSession =
      session.type === "RACE" || session.type === "FINAL_RACE";
    const isQualifyingSession =
      session.type === "QUALIFYING" || session.type === "FINAL_QUALIFYING";

    if (isRaceSession && !pointsMultiplier) {
      return NextResponse.json(
        { error: "Points multiplier is required for race sessions" },
        { status: 400 }
      );
    }

    if (isRaceSession && !["NORMAL", "HALF", "DOUBLE"].includes(pointsMultiplier)) {
      return NextResponse.json(
        { error: "Invalid points multiplier" },
        { status: 400 }
      );
    }

    // Use transaction to ensure consistency
    const savedResults = await db.$transaction(async (tx) => {
      // Update session multiplier if it's a race session
      if (isRaceSession) {
        await tx.session.update({
          where: { id: sessionId },
          data: {
            pointsMultiplier: pointsMultiplier as PointsMultiplier,
          },
        });
      } else if (isQualifyingSession) {
        // Ensure qualifying sessions have null multiplier
        await tx.session.update({
          where: { id: sessionId },
          data: {
            pointsMultiplier: null,
          },
        });
      }

      // Delete existing results for this session
      await tx.sessionResult.deleteMany({
        where: { sessionId },
      });

      // Calculate and create new results
      const sessionType = session.type as SessionType;
      const multiplier =
        isRaceSession && pointsMultiplier
          ? (pointsMultiplier as PointsMultiplier)
          : null;

      const resultsToCreate = results.map((result: any) => {
        const points = calculateSessionPoints(
          sessionType,
          result.position,
          multiplier
        );

        return {
          sessionId,
          driverId: result.driverId,
          position: result.position,
          points,
        };
      });

      await tx.sessionResult.createMany({
        data: resultsToCreate,
      });

      // Fetch and return the created results
      return await tx.sessionResult.findMany({
        where: { sessionId },
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { position: "asc" },
      });
    });

    return NextResponse.json(savedResults, { status: 200 });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 }
    );
  }
}
