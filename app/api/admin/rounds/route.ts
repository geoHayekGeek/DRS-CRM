import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRoundStatus } from "@/lib/round-status";

export async function GET() {
  try {
    const rounds = await db.round.findMany({
      include: {
        track: true,
        championship: {
          select: {
            id: true,
            name: true,
            isCurrent: true,
          },
        },
        sessions: {
          select: {
            type: true,
            group: true,
            status: true,
            results: { select: { id: true } },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { roundDrivers: true } },
      },
      orderBy: { date: "desc" },
    });

    const isLegacyGroupFinal = (s: { type: string; group: string | null }) =>
      (s.type === "FINAL_QUALIFYING" || s.type === "FINAL_RACE") && s.group !== null;

    const isSessionComplete = (
      s: { status: string; results: { id: string }[] }
    ) => s.status === "COMPLETED" || s.results.length > 0;

    const roundsWithStatus = rounds.map((r) => {
      const relevantSessions = r.sessions.filter((s) => !isLegacyGroupFinal(s));
      const allSessionsComplete =
        relevantSessions.length > 0 &&
        relevantSessions.every((s) => isSessionComplete(s));
      const roundStatus = getRoundStatus({
        date: r.date,
        numberOfGroups: r.numberOfGroups ?? 0,
        setupCompleted: r.setupCompleted ?? false,
        driverCount: r._count?.roundDrivers ?? 0,
        allSessionsComplete,
      });
      const { sessions, _count, ...rest } = r;
      return { ...rest, roundStatus };
    });

    return NextResponse.json(roundsWithStatus);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    );
  }
}

function parseAvailableKarts(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    const nums = value.filter((x) => typeof x === "number" && Number.isInteger(x));
    const unique = [...new Set(nums)];
    return unique.length === nums.length ? unique : null;
  }
  if (typeof value === "string") {
    const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
    const nums: number[] = [];
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (isNaN(n) || !Number.isInteger(n)) return null;
      nums.push(n);
    }
    const unique = [...new Set(nums)];
    return unique.length === nums.length ? unique : null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, trackId, championshipId, numberOfGroups, availableKarts, driverIds } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Round name is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const roundDate = new Date(date);
    if (isNaN(roundDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const trackIdOpt =
      trackId != null && typeof trackId === "string" && trackId.trim() !== ""
        ? trackId.trim()
        : null;

    if (!championshipId || typeof championshipId !== "string") {
      return NextResponse.json(
        { error: "Championship is required" },
        { status: 400 }
      );
    }

    const numGroups =
      numberOfGroups !== undefined && numberOfGroups !== null
        ? Number(numberOfGroups)
        : 0;
    if (!Number.isInteger(numGroups) || numGroups < 0) {
      return NextResponse.json(
        { error: "Number of groups must be 0 or greater" },
        { status: 400 }
      );
    }

    const karts =
      availableKarts === undefined || availableKarts === null
        ? []
        : parseAvailableKarts(availableKarts) ?? [];

    const driverIdsArray = Array.isArray(driverIds)
      ? (driverIds as unknown[]).filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [];
    const uniqueDriverIds = [...new Set(driverIdsArray)];

    let validIds = new Set<string>();
    if (uniqueDriverIds.length > 0) {
      const validDrivers = await db.driver.findMany({
        where: { id: { in: uniqueDriverIds } },
        select: { id: true },
      });
      validIds = new Set(validDrivers.map((d) => d.id));
      const missing = uniqueDriverIds.filter((id) => !validIds.has(id));
      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Driver(s) not found: ${missing.join(", ")}` },
          { status: 400 }
        );
      }
    }

    if (trackIdOpt) {
      const track = await db.track.findUnique({
        where: { id: trackIdOpt },
      });
      if (!track) {
        return NextResponse.json(
          { error: "Track not found" },
          { status: 404 }
        );
      }
    }

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const round = await db.$transaction(async (tx) => {
      const created = await tx.round.create({
        data: {
          name: name.trim(),
          date: roundDate,
          ...(trackIdOpt && { trackId: trackIdOpt }),
          championshipId,
          numberOfGroups: numGroups,
          availableKarts: karts,
        },
      });

      if (uniqueDriverIds.length > 0) {
        await tx.roundDriver.createMany({
          data: uniqueDriverIds.map((driverId) => ({
            roundId: created.id,
            driverId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.round.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          track: true,
          championship: {
            select: {
              id: true,
              name: true,
              isCurrent: true,
            },
          },
        },
      });
    });

    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    console.error("Error creating round:", error);
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 }
    );
  }
}
