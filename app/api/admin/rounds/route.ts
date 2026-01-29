import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rounds = await db.round.findMany({
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
      orderBy: { date: "desc" },
    });

    return NextResponse.json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    );
  }
}

function parseAvailableKarts(value: unknown): number[] | null {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, trackId, championshipId, numberOfGroups, availableKarts } = body;

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

    const numGroups =
      numberOfGroups !== undefined && numberOfGroups !== null
        ? Number(numberOfGroups)
        : 4;
    if (!Number.isInteger(numGroups) || numGroups < 1) {
      return NextResponse.json(
        { error: "Number of groups must be at least 1" },
        { status: 400 }
      );
    }

    const karts = parseAvailableKarts(availableKarts);
    if (karts === null) {
      return NextResponse.json(
        { error: "Available karts must be a list of unique integers (e.g. comma-separated)" },
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

    const round = await db.round.create({
      data: {
        name: name.trim(),
        date: roundDate,
        trackId,
        championshipId,
        numberOfGroups: numGroups,
        availableKarts: karts,
      },
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

    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    console.error("Error creating round:", error);
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 }
    );
  }
}
