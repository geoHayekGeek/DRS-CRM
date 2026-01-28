import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roundId = params.id;

    // Check if round exists
    const round = await db.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    // Check if setup already done
    const existingSessions = await db.session.findFirst({
      where: { roundId },
    });

    if (existingSessions) {
      return NextResponse.json(
        { error: "Round has already been set up" },
        { status: 400 }
      );
    }

    // Get all drivers
    const drivers = await db.driver.findMany();
    
    if (drivers.length === 0) {
      return NextResponse.json(
        { error: "No drivers found. Add drivers before setting up the round." },
        { status: 400 }
      );
    }

    // Perform setup in a transaction
    await db.$transaction(async (tx) => {
      // Shuffle drivers and assign to groups
      const shuffledDrivers = shuffleArray(drivers);
      const groups = ["A", "B", "C", "D"];
      const driversPerGroup = Math.ceil(shuffledDrivers.length / groups.length);

      // Create group assignments
      const groupAssignments: Prisma.GroupAssignmentCreateManyInput[] = [];
      const kartNumbers = Array.from({ length: shuffledDrivers.length }, (_, i) => i + 1);
      const shuffledKarts = shuffleArray(kartNumbers);

      shuffledDrivers.forEach((driver, index) => {
        const groupIndex = Math.floor(index / driversPerGroup);
        const group = groups[Math.min(groupIndex, groups.length - 1)];
        const kartNumber = shuffledKarts[index];

        groupAssignments.push({
          roundId,
          driverId: driver.id,
          group,
          kartNumber,
        });
      });

      await tx.groupAssignment.createMany({
        data: groupAssignments,
      });

      // Create sessions
      const sessions: Prisma.SessionCreateManyInput[] = [];
      let order = 1;

      // 4 Qualifying sessions
      for (let i = 1; i <= 4; i++) {
        sessions.push({
          roundId,
          type: "QUALIFYING",
          group: null,
          order: order++,
        });
      }

      // 4 Group races (A, B, C, D)
      for (const group of groups) {
        sessions.push({
          roundId,
          type: "RACE",
          group,
          order: order++,
        });
      }

      // 1 Final Qualifying
      sessions.push({
        roundId,
        type: "FINAL_QUALIFYING",
        group: null,
        order: order++,
      });

      // 1 Final Race
      sessions.push({
        roundId,
        type: "FINAL_RACE",
        group: null,
        order: order++,
      });

      await tx.session.createMany({
        data: sessions,
      });
    });

    return NextResponse.json(
      { success: true, message: "Round set up successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting up round:", error);
    return NextResponse.json(
      { error: "Failed to set up round" },
      { status: 500 }
    );
  }
}
