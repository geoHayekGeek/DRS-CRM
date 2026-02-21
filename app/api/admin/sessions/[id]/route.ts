import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFinalQualifyingDrivers } from "@/lib/final-qualifying";
import { getFinalRaceDrivers } from "@/lib/final-race";

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

    const sessionWithStatus = session as { status?: string };
    let eligibleDrivers: { id: string; fullName: string; group: string; kartNumber?: number }[] = [];
    let sessionStatus = sessionWithStatus.status ?? "READY";

    if (session.type === "FINAL_QUALIFYING" && session.group === null) {
      const fqCheck = await getFinalQualifyingDrivers(session.roundId);
      if (fqCheck.ready) {
        eligibleDrivers = fqCheck.drivers.map((d) => ({
          id: d.id,
          fullName: d.fullName,
          group: d.group,
        }));
        sessionStatus = session.results.length > 0 ? "COMPLETED" : "READY";
        if (sessionWithStatus.status === "PENDING") {
          await db.session.update({
            where: { id: sessionId },
            data: { status: "READY" },
          });
        }
      } else {
        sessionStatus = "PENDING";
        eligibleDrivers = [];
      }
    } else if (session.type === "FINAL_RACE" && session.group === null) {
      const frCheck = await getFinalRaceDrivers(session.roundId);
      if (frCheck.ready) {
        eligibleDrivers = frCheck.drivers.map((d) => ({
          id: d.id,
          fullName: d.fullName,
          group: d.group,
        }));
        sessionStatus = session.results.length > 0 ? "COMPLETED" : "READY";
        if (sessionWithStatus.status === "PENDING") {
          await db.session.update({
            where: { id: sessionId },
            data: { status: "READY" },
          });
        }
      } else {
        sessionStatus = "PENDING";
        eligibleDrivers = [];
      }
    } else if (session.group) {
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
        status: sessionStatus,
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
