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

function getGroupLabels(count: number): string[] {
  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    labels.push(String.fromCharCode(65 + i));
  }
  return labels;
}

export async function POST(
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

    if (round.setupCompleted) {
      return NextResponse.json(
        { error: "Round has already been set up" },
        { status: 400 }
      );
    }

    const existingSessions = await db.session.findFirst({
      where: { roundId },
    });

    if (existingSessions) {
      return NextResponse.json(
        { error: "Round has already been set up" },
        { status: 400 }
      );
    }

    if (round.numberOfGroups < 1) {
      return NextResponse.json(
        { error: "Number of groups must be at least 1" },
        { status: 400 }
      );
    }

    const roundDrivers = await db.roundDriver.findMany({
      where: { roundId },
      include: { driver: true },
    });
    const drivers = roundDrivers.map((rd) => rd.driver);

    if (drivers.length === 0) {
      return NextResponse.json(
        { error: "No participating drivers for this round. Add drivers on the round Edit page before setting up." },
        { status: 400 }
      );
    }

    const availableKarts = round.availableKarts ?? [];
    if (availableKarts.length === 0) {
      return NextResponse.json(
        { error: "At least one kart is required. Add kart numbers in the round settings." },
        { status: 400 }
      );
    }

    const groupLabels = getGroupLabels(round.numberOfGroups);

    await db.$transaction(async (tx) => {
      const shuffledDrivers = shuffleArray(drivers);
      const shuffledKarts = shuffleArray([...availableKarts]);

      const groupAssignments: Prisma.GroupAssignmentCreateManyInput[] = [];
      shuffledDrivers.forEach((driver, index) => {
        const groupIndex = index % groupLabels.length;
        const group = groupLabels[groupIndex];
        const kartNumber = shuffledKarts[index % shuffledKarts.length];

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

      const sessions: Prisma.SessionCreateManyInput[] = [];
      let order = 1;

      for (let i = 1; i <= 4; i++) {
        sessions.push({
          roundId,
          type: "QUALIFYING",
          group: null,
          order: order++,
        });
      }

      for (const group of groupLabels) {
        sessions.push({
          roundId,
          type: "RACE",
          group,
          order: order++,
        });
      }

      sessions.push({
        roundId,
        type: "FINAL_QUALIFYING",
        group: null,
        order: order++,
      });

      sessions.push({
        roundId,
        type: "FINAL_RACE",
        group: null,
        order: order++,
      });

      await tx.session.createMany({
        data: sessions,
      });

      await tx.round.update({
        where: { id: roundId },
        data: { setupCompleted: true },
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
