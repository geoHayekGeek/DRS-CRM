import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatSessionType(type: string): string {
  switch (type) {
    case "QUALIFYING":
      return "Qualifying";
    case "RACE":
      return "Race";
    case "FINAL_QUALIFYING":
      return "Final Qualifying";
    case "FINAL_RACE":
      return "Final Race";
    default:
      return type;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roundId = params.id;
    if (!roundId || !UUID_REGEX.test(roundId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sessions = await db.session.findMany({
      where: { roundId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        type: true,
        order: true,
        results: {
          orderBy: { position: "asc" },
          select: {
            position: true,
            points: true,
            driver: { select: { fullName: true } },
          },
        },
      },
    });

    const list = sessions.map((s) => ({
      id: s.id,
      name: formatSessionType(s.type),
      order: s.order,
      results: s.results.map((r) => ({
        position: r.position,
        driverName: r.driver.fullName,
        time: "—",
        points: r.points,
      })),
    }));

    return NextResponse.json({ sessions: list });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
