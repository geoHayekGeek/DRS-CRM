import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRoundStatus, type RoundStatus } from "@/lib/round-status";

const LEGACY_GROUP_FINAL = (s: { type: string; group: string | null }) =>
  (s.type === "FINAL_QUALIFYING" || s.type === "FINAL_RACE") && s.group !== null;

function isSessionComplete(s: { status: string; results: { id: string }[] }): boolean {
  return s.status === "COMPLETED" || s.results.length > 0;
}

export type RoundsFeedItem = {
  id: string;
  name: string;
  championship_id: string | null;
  championship_name: string;
  date: string;
  track_name: string;
  computed_status: RoundStatus;
  updated_at: string;
};

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedCutoff = new Date(today);
    completedCutoff.setDate(completedCutoff.getDate() - 30);

    const rounds = await db.round.findMany({
      orderBy: { date: "asc" },
      include: {
        track: { select: { name: true } },
        championship: { select: { id: true, name: true } },
        sessions: {
          select: {
            type: true,
            group: true,
            status: true,
            results: { select: { id: true } },
          },
        },
        _count: { select: { roundDrivers: true } },
      },
    });

    const items: RoundsFeedItem[] = rounds.map((r) => {
      const relevantSessions = r.sessions.filter((s) => !LEGACY_GROUP_FINAL(s));
      const allSessionsComplete =
        relevantSessions.length > 0 &&
        relevantSessions.every((s) => isSessionComplete(s));

      const status = getRoundStatus({
        date: r.date,
        numberOfGroups: r.numberOfGroups,
        setupCompleted: r.setupCompleted,
        driverCount: r._count.roundDrivers,
        allSessionsComplete,
      });

      return {
        id: r.id,
        name: r.name,
        championship_id: r.championshipId,
        championship_name: r.championship?.name ?? "—",
        date: r.date.toISOString(),
        track_name: r.track?.name ?? "—",
        computed_status: status,
        updated_at: r.updatedAt.toISOString(),
      };
    });

    const filtered = items.filter((item) => {
      if (item.computed_status === "COMPLETED") {
        return new Date(item.updated_at).getTime() >= completedCutoff.getTime();
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const statusOrder = (s: RoundStatus) =>
        s === "IN_PROGRESS" ? 0 : s === "UPCOMING" ? 1 : 2;
      const orderA = statusOrder(a.computed_status);
      const orderB = statusOrder(b.computed_status);
      if (orderA !== orderB) return orderA - orderB;
      if (a.computed_status === "UPCOMING")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (a.computed_status === "COMPLETED")
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return NextResponse.json({ rounds: sorted });
  } catch (error) {
    console.error("[rounds-feed]", error);
    return NextResponse.json({ rounds: [] });
  }
}
