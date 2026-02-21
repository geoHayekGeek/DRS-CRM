import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
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

    const roundDrivers = await db.roundDriver.findMany({
      where: { roundId },
      include: {
        driver: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      roundDrivers.map((rd) => ({
        id: rd.id,
        driverId: rd.driverId,
        fullName: rd.driver.fullName,
        createdAt: rd.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching round drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch round drivers" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roundId = params.id;
    const body = await request.json();

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
        { error: "Cannot change participating drivers after round setup" },
        { status: 400 }
      );
    }

    const driverIds = body.driverIds ?? [];
    if (!Array.isArray(driverIds)) {
      return NextResponse.json(
        { error: "driverIds must be an array" },
        { status: 400 }
      );
    }

    const validIds = driverIds.filter(
      (id: unknown) => typeof id === "string" && id.trim().length > 0
    );
    const uniqueIds = [...new Set(validIds)];

    const existingDrivers = await db.driver.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingDrivers.map((d) => d.id));
    const missing = uniqueIds.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Driver(s) not found: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.roundDriver.deleteMany({
        where: { roundId },
      });

      if (uniqueIds.length > 0) {
        await tx.roundDriver.createMany({
          data: uniqueIds.map((driverId) => ({
            roundId,
            driverId,
          })),
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating round drivers:", error);
    return NextResponse.json(
      { error: "Failed to update round drivers" },
      { status: 500 }
    );
  }
}
