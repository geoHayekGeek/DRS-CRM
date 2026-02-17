import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const FEATURED_LIMIT = 3;
const UPCOMING_DAYS = 30;

export async function GET() {
  try {
    const now = new Date();
    const futureCutoff = new Date(now);
    futureCutoff.setDate(futureCutoff.getDate() + UPCOMING_DAYS);

    if (!db.event) {
      console.warn("[events/featured] Prisma client has no event model. Run: npx prisma generate");
      return NextResponse.json({ now: now.toISOString(), events: [] }, { status: 200 });
    }

    const allEvents = await db.event.findMany({
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        location: true,
      },
    });

    type EventWithStatus = {
      id: string;
      title: string;
      startsAt: string;
      endsAt: string | null;
      location: string | null;
      status: "ONGOING" | "UPCOMING";
    };

    const ongoing: EventWithStatus[] = [];
    const upcoming: EventWithStatus[] = [];

    for (const e of allEvents) {
      const start = e.startsAt;
      const end = e.endsAt;

      if (end) {
        if (now >= start && now <= end) {
          ongoing.push({
            id: e.id,
            title: e.title,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            location: e.location,
            status: "ONGOING",
          });
        } else if (start > now && start <= futureCutoff) {
          upcoming.push({
            id: e.id,
            title: e.title,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            location: e.location,
            status: "UPCOMING",
          });
        }
      } else {
        if (start > now && start <= futureCutoff) {
          upcoming.push({
            id: e.id,
            title: e.title,
            startsAt: start.toISOString(),
            endsAt: null,
            location: e.location,
            status: "UPCOMING",
          });
        }
      }
    }

    const result: EventWithStatus[] = [...ongoing, ...upcoming].slice(0, FEATURED_LIMIT);

    return NextResponse.json({
      now: now.toISOString(),
      events: result,
    });
  } catch (error) {
    console.error("[events/featured]", error);
    return NextResponse.json(
      { now: new Date().toISOString(), events: [] },
      { status: 200 }
    );
  }
}
