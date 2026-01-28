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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, trackId, championshipId } = body;

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

    const round = await db.round.create({
      data: {
        name: name.trim(),
        date: roundDate,
        trackId,
        championshipId,
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
