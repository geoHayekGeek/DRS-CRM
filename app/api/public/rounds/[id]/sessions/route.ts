import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noStoreJson } from "@/lib/http-cache";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSessionDisplayName(
  type: string,
  group: string | null,
  order?: number
): string {
  const typeLabels: Record<string, string> = {
    QUALIFYING: "Qualifying",
    RACE: "Race",
    FINAL_QUALIFYING: "Final Qualifying",
    FINAL_RACE: "Final Race",
  };
  const typeLabel = typeLabels[type] ?? type;
  if (group) {
    return `Group ${group} - ${typeLabel}`;
  }
  if (type === "QUALIFYING" && order != null) {
    return `Qualifying ${order}`;
  }
  return typeLabel;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roundId = params.id;
    if (!roundId || !UUID_REGEX.test(roundId)) {
      return noStoreJson({ error: "Not found" }, { status: 404 });
    }

    const sessions = await db.session.findMany({
      where: { roundId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        type: true,
        group: true,
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

    const isLegacyGroupFinal = (s: { type: string; group: string | null }) =>
      (s.type === "FINAL_QUALIFYING" || s.type === "FINAL_RACE") &&
      s.group !== null;

    const filteredSessions = sessions.filter((s) => !isLegacyGroupFinal(s));

    const list = filteredSessions.map((s) => ({
      id: s.id,
      name: getSessionDisplayName(s.type, s.group ?? null, s.order),
      order: s.order,
      results: s.results.map((r) => ({
        position: r.position,
        driverName: r.driver.fullName,
        time: "—",
        points: r.points,
      })),
    }));

    return noStoreJson({ sessions: list });
  } catch (error) {
    return noStoreJson(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
