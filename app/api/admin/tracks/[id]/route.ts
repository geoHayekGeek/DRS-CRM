import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanupDirectory } from "@/lib/fs-cleanup";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await db.track.findUnique({
      where: { id: params.id },
      include: {
        rounds: {
          orderBy: { date: "desc" },
        },
        trackImages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(track);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, lengthMeters, location } = body;

    const existingTrack = await db.track.findUnique({
      where: { id: params.id },
    });

    if (!existingTrack) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

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

    const track = await db.track.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        lengthMeters,
        location: location?.trim() || null,
      },
    });

    return NextResponse.json(track);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update track" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingTrack = await db.track.findUnique({
      where: { id: params.id },
    });

    if (!existingTrack) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    await db.track.delete({
      where: { id: params.id },
    });

    await cleanupDirectory(`uploads/tracks/${params.id}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete track" },
      { status: 500 }
    );
  }
}
