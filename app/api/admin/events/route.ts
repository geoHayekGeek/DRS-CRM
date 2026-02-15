import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: { startsAt: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, startsAt, endsAt, location, description } = body;

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

    let endsAtDate: Date | null = null;
    if (endsAt != null && endsAt !== "") {
      endsAtDate = new Date(endsAt);
      if (isNaN(endsAtDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date/time" },
          { status: 400 }
        );
      }
      if (endsAtDate < startsAtDate) {
        return NextResponse.json(
          { error: "End date/time must be on or after start date/time" },
          { status: 400 }
        );
      }
    }

    if (location != null && typeof location === "string" && location.trim().length > 120) {
      return NextResponse.json(
        { error: "Location must be at most 120 characters" },
        { status: 400 }
      );
    }

    const event = await db.event.create({
      data: {
        title: title.trim(),
        description: description != null && description !== "" ? String(description).trim() : null,
        startsAt: startsAtDate,
        endsAt: endsAtDate,
        location: location?.trim() || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
