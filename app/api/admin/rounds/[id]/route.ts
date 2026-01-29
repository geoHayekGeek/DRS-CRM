import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const round = await db.round.findUnique({
      where: { id: params.id },
      include: {
        track: true,
        championship: {
          select: {
            id: true,
            name: true,
            isCurrent: true,
          },
        },
      },
    });

    if (!round) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(round);
  } catch (error) {
    console.error("Error fetching round:", error);
    return NextResponse.json(
      { error: "Failed to fetch round" },
      { status: 500 }
    );
  }
}

function parseAvailableKartsPut(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    const nums = value.filter((x) => typeof x === "number" && Number.isInteger(x));
    const unique = [...new Set(nums)];
    return unique.length === nums.length ? unique : null;
  }
  if (typeof value === "string") {
    const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
    const nums: number[] = [];
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (isNaN(n) || !Number.isInteger(n)) return null;
      nums.push(n);
    }
    const unique = [...new Set(nums)];
    return unique.length === nums.length ? unique : null;
  }
  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, date, trackId, championshipId, numberOfGroups, availableKarts } = body;

    const existingRound = await db.round.findUnique({
      where: { id: params.id },
    });

    if (!existingRound) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Round name is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const roundDate = new Date(date);
    if (isNaN(roundDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (!trackId || typeof trackId !== "string") {
      return NextResponse.json(
        { error: "Track is required" },
        { status: 400 }
      );
    }

    if (!championshipId || typeof championshipId !== "string") {
      return NextResponse.json(
        { error: "Championship is required" },
        { status: 400 }
      );
    }

    const track = await db.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const data: {
      name: string;
      date: Date;
      trackId: string;
      championshipId: string;
      numberOfGroups?: number;
      availableKarts?: number[];
    } = {
      name: name.trim(),
      date: roundDate,
      trackId,
      championshipId,
    };

    if (!existingRound.setupCompleted) {
      if (numberOfGroups !== undefined && numberOfGroups !== null) {
        const numGroups = Number(numberOfGroups);
        if (!Number.isInteger(numGroups) || numGroups < 1) {
          return NextResponse.json(
            { error: "Number of groups must be at least 1" },
            { status: 400 }
          );
        }
        data.numberOfGroups = numGroups;
      }
      if (availableKarts !== undefined) {
        const karts = parseAvailableKartsPut(availableKarts);
        if (karts === null) {
          return NextResponse.json(
            { error: "Available karts must be a list of unique integers (e.g. comma-separated)" },
            { status: 400 }
          );
        }
        data.availableKarts = karts;
      }
    }

    const round = await db.round.update({
      where: { id: params.id },
      data,
      include: {
        track: true,
        championship: {
          select: {
            id: true,
            name: true,
            isCurrent: true,
          },
        },
      },
    });

    return NextResponse.json(round);
  } catch (error) {
    console.error("Error updating round:", error);
    return NextResponse.json(
      { error: "Failed to update round" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingRound = await db.round.findUnique({
      where: { id: params.id },
    });

    if (!existingRound) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    await db.round.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting round:", error);
    return NextResponse.json(
      { error: "Failed to delete round" },
      { status: 500 }
    );
  }
}
