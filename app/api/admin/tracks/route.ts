import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tracks = await db.track.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tracks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, lengthMeters, location } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Track name is required" },
        { status: 400 }
      );
    }

    if (lengthMeters === undefined || lengthMeters === null) {
      return NextResponse.json(
        { error: "Length in meters is required" },
        { status: 400 }
      );
    }

    if (typeof lengthMeters !== "number" || lengthMeters <= 0) {
      return NextResponse.json(
        { error: "Length must be a positive number" },
        { status: 400 }
      );
    }

    const track = await db.track.create({
      data: {
        name: name.trim(),
        lengthMeters,
        location: location?.trim() || null,
      },
    });

    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create track" },
      { status: 500 }
    );
  }
}
