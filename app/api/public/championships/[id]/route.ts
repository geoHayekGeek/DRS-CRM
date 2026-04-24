import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noStoreJson } from "@/lib/http-cache";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id || !UUID_REGEX.test(id)) {
      return noStoreJson({ error: "Not found" }, { status: 404 });
    }

    const championship = await db.championship.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!championship) {
      return noStoreJson({ error: "Not found" }, { status: 404 });
    }

    const rounds = await db.round.findMany({
      where: { championshipId: id },
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        date: true,
        track: { select: { name: true, location: true } },
      },
    });

    const roundIds = rounds.map((r) => r.id);
    let standings: { fullName: string; totalPoints: number; roundsPlayed: number }[] = [];

    if (roundIds.length > 0) {
      const results = await db.sessionResult.findMany({
        where: { session: { roundId: { in: roundIds } } },
        select: {
          driverId: true,
          points: true,
          session: { select: { roundId: true } },
        },
      });
      const driverPoints = new Map<string, number>();
      const driverRoundIds = new Map<string, Set<string>>();
      for (const r of results) {
        const cur = driverPoints.get(r.driverId) ?? 0;
        driverPoints.set(r.driverId, cur + r.points);
        if (!driverRoundIds.has(r.driverId)) driverRoundIds.set(r.driverId, new Set());
        driverRoundIds.get(r.driverId)!.add(r.session.roundId);
      }
      const driverIds = Array.from(driverPoints.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([driverId]) => driverId);
      if (driverIds.length > 0) {
        const drivers = await db.driver.findMany({
          where: { id: { in: driverIds } },
          select: { id: true, fullName: true },
        });
        const nameMap = new Map(drivers.map((d) => [d.id, d.fullName]));
        standings = driverIds.map((driverId) => {
          const roundIdsWithResults = driverRoundIds.get(driverId) ?? new Set<string>();
          const roundsPlayed = roundIdsWithResults.size;
          return {
            fullName: nameMap.get(driverId) ?? "—",
            totalPoints: driverPoints.get(driverId) ?? 0,
            roundsPlayed,
          };
        });
      }
    }

    const now = new Date();
    const roundsWithStatus = rounds.map((r) => ({
      id: r.id,
      name: r.name,
      date: r.date.toISOString(),
      trackName: r.track?.name ?? null,
      location: r.track?.location ?? null,
      status: r.date < now ? "Completed" : "Upcoming",
    }));

    return noStoreJson({
      championship: {
        id: championship.id,
        name: championship.name,
        startDate: championship.startDate.toISOString(),
        endDate: championship.endDate?.toISOString() ?? null,
      },
      rounds: roundsWithStatus,
      standings,
    });
  } catch (error) {
    return noStoreJson(
      { error: "Failed to fetch championship" },
      { status: 500 }
    );
  }
}
