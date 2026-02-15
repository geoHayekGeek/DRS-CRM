import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getEventStatus(startsAt: Date, endsAt: Date | null): "ONGOING" | "UPCOMING" | "PAST" {
  const now = new Date();
  if (endsAt && now >= startsAt && now <= endsAt) {
    return "ONGOING";
  }
  if (startsAt > now) {
    return "UPCOMING";
  }
  return "PAST";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const event = await db.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        startsAt: true,
        endsAt: true,
        location: true,
        eventImages: {
          select: { id: true, imagePath: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const status = getEventStatus(event.startsAt, event.endsAt);

    return NextResponse.json({
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt?.toISOString() ?? null,
      location: event.location,
      status,
      images: event.eventImages.map((img) => ({ id: img.id, url: img.imagePath })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
