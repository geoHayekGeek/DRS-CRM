import { NextRequest, NextResponse } from "next/server";
import { Prisma, SessionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  calculateSessionPoints,
  SessionType,
  PointsMultiplier,
} from "@/lib/points";
import { getFinalQualifyingDrivers } from "@/lib/final-qualifying";
import { getFinalRaceDrivers } from "@/lib/final-race";

function hasSameDriverSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  for (const id of a) {
    if (!setB.has(id)) return false;
  }
  return true;
}

async function syncDependentFinalSessions(roundId: string): Promise<void> {
  const finalQualifyingSession = await db.session.findFirst({
    where: {
      roundId,
      type: "FINAL_QUALIFYING",
      group: null,
    },
    select: {
      id: true,
      status: true,
      results: {
        select: {
          driverId: true,
        },
      },
    },
  });

  const finalRaceSession = await db.session.findFirst({
    where: {
      roundId,
      type: "FINAL_RACE",
      group: null,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!finalQualifyingSession) return;

  const fqCheck = await getFinalQualifyingDrivers(roundId);
  const currentParticipantIds = finalQualifyingSession.results.map((r) => r.driverId);
  const expectedParticipantIds = fqCheck.ready
    ? fqCheck.drivers.map((d) => d.id)
    : [];

  const participantsChanged =
    !fqCheck.ready || !hasSameDriverSet(currentParticipantIds, expectedParticipantIds);

  const nextFinalQualifyingStatus = !fqCheck.ready
    ? SessionStatus.PENDING
    : participantsChanged
    ? SessionStatus.READY
    : finalQualifyingSession.results.length > 0
    ? SessionStatus.COMPLETED
    : SessionStatus.READY;

  const updates: Prisma.PrismaPromise<unknown>[] = [];

  if (participantsChanged && finalQualifyingSession.results.length > 0) {
    updates.push(
      db.sessionResult.deleteMany({
        where: {
          sessionId: finalQualifyingSession.id,
        },
      })
    );
  }

  if (finalQualifyingSession.status !== nextFinalQualifyingStatus) {
    updates.push(
      db.session.update({
        where: { id: finalQualifyingSession.id },
        data: { status: nextFinalQualifyingStatus },
      })
    );
  }

  if (participantsChanged && finalRaceSession) {
    updates.push(
      db.sessionResult.deleteMany({
        where: {
          sessionId: finalRaceSession.id,
        },
      })
    );

    if (finalRaceSession.status !== SessionStatus.PENDING) {
      updates.push(
        db.session.update({
          where: { id: finalRaceSession.id },
          data: { status: SessionStatus.PENDING },
        })
      );
    }
  }

  if (updates.length > 0) {
    await db.$transaction(updates);
  }
}

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

    let eligibleDriverIds: string[] = [];

    if (session.type === "FINAL_QUALIFYING" && session.group === null) {
      const fqCheck = await getFinalQualifyingDrivers(session.roundId);
      if (!fqCheck.ready) {
        return NextResponse.json(
          {
            error:
              "Final Qualifying is waiting for group-session results to determine drivers.",
          },
          { status: 400 }
        );
      }
      eligibleDriverIds = fqCheck.drivers.map((d) => d.id);
    } else if (session.type === "FINAL_RACE" && session.group === null) {
      const frCheck = await getFinalRaceDrivers(session.roundId);
      if (!frCheck.ready) {
        return NextResponse.json(
          {
            error:
              "Final Race is waiting for final qualifying to determine grid.",
          },
          { status: 400 }
        );
      }
      eligibleDriverIds = frCheck.drivers.map((d) => d.id);
    } else if (session.group) {
      const groupAssignments = await db.groupAssignment.findMany({
        where: {
          roundId: session.roundId,
          group: session.group,
        },
        select: { driverId: true },
      });
      eligibleDriverIds = groupAssignments.map((a) => a.driverId);
    } else {
      const groupAssignments = await db.groupAssignment.findMany({
        where: { roundId: session.roundId },
        select: { driverId: true },
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
      const sessionUpdateData: { pointsMultiplier?: PointsMultiplier | null; status?: SessionStatus } =
        {};
      if (isRaceSession) {
        sessionUpdateData.pointsMultiplier = pointsMultiplier as PointsMultiplier;
      } else if (isQualifyingSession) {
        sessionUpdateData.pointsMultiplier = null;
      }
      // Any session with saved results is completed
      sessionUpdateData.status = SessionStatus.COMPLETED;
      if (Object.keys(sessionUpdateData).length > 0) {
        await tx.session.update({
          where: { id: sessionId },
          data: sessionUpdateData,
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

    if (session.type === "QUALIFYING" || session.type === "RACE") {
      await syncDependentFinalSessions(session.roundId);
    }

    revalidatePath("/", "layout");

    return NextResponse.json(savedResults, { status: 200 });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 }
    );
  }
}
