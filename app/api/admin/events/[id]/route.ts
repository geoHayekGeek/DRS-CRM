import { NextRequest, NextResponse } from "next/server";
import { unlink, rm } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await db.event.findUnique({
      where: { id: params.id },
      include: { eventImages: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.event.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, startsAt, endsAt, location, description } = body;

    let updateData: {
      title?: string;
      startsAt?: Date;
      endsAt?: Date | null;
      location?: string | null;
      description?: string | null;
    } = {};

    if (title !== undefined) {
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }
      if (title.trim().length > 120) {
        return NextResponse.json(
          { error: "Title must be at most 120 characters" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (startsAt !== undefined) {
      if (!startsAt) {
        return NextResponse.json(
          { error: "Start date/time is required" },
          { status: 400 }
        );
      }
      const startsAtDate = new Date(startsAt);
      if (isNaN(startsAtDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date/time" },
          { status: 400 }
        );
      }
      updateData.startsAt = startsAtDate;
    }

    if (endsAt !== undefined) {
      if (endsAt == null || endsAt === "") {
        updateData.endsAt = null;
      } else {
        const endsAtDate = new Date(endsAt);
        if (isNaN(endsAtDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid end date/time" },
            { status: 400 }
          );
        }
        const start = updateData.startsAt ?? existing.startsAt;
        if (endsAtDate < start) {
          return NextResponse.json(
            { error: "End date/time must be on or after start date/time" },
            { status: 400 }
          );
        }
        updateData.endsAt = endsAtDate;
      }
    }

    if (location !== undefined) {
      if (location == null || location === "") {
        updateData.location = null;
      } else if (typeof location === "string") {
        if (location.trim().length > 120) {
          return NextResponse.json(
            { error: "Location must be at most 120 characters" },
            { status: 400 }
          );
        }
        updateData.location = location.trim() || null;
      }
    }

    if (description !== undefined) {
      updateData.description = description == null || description === "" ? null : String(description).trim();
    }

    const event = await db.event.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.event.findUnique({
      where: { id: params.id },
      include: { eventImages: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    for (const img of existing.eventImages) {
      const filePath = path.join(process.cwd(), "public", img.imagePath);
      try {
        await unlink(filePath);
      } catch {
        // File may already be missing
      }
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "events", params.id);
    try {
      await rm(uploadDir, { recursive: true });
    } catch {
      // Directory may not exist or already removed
    }

    await db.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
