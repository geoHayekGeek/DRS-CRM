import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const championshipId = params.id;

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const assigned = await db.championshipDriver.findMany({
      where: { championshipId },
      include: {
        driver: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      assigned.map((cd) => ({
        id: cd.id,
        driverId: cd.driverId,
        fullName: cd.driver.fullName,
        createdAt: cd.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching championship drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch championship drivers" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const championshipId = params.id;
    const body = await request.json();

    const championship = await db.championship.findUnique({
      where: { id: championshipId },
    });

    if (!championship) {
      return NextResponse.json(
        { error: "Championship not found" },
        { status: 404 }
      );
    }

    const driverIds = body.driverIds ?? (body.driverId ? [body.driverId] : []);
    if (!Array.isArray(driverIds) || driverIds.length === 0) {
      return NextResponse.json(
        { error: "driverId or driverIds array is required" },
        { status: 400 }
      );
    }

    const validIds = driverIds.filter(
      (id: unknown) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "At least one valid driver id is required" },
        { status: 400 }
      );
    }

    const existingDrivers = await db.driver.findMany({
      where: { id: { in: validIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingDrivers.map((d) => d.id));
    const missing = validIds.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Driver(s) not found: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const created: { driverId: string; fullName: string }[] = [];

    for (const driverId of validIds) {
      const existing = await db.championshipDriver.findUnique({
        where: {
          championshipId_driverId: { championshipId, driverId },
        },
      });
      if (existing) continue;

      const cd = await db.championshipDriver.create({
        data: { championshipId, driverId },
        include: {
          driver: { select: { id: true, fullName: true } },
        },
      });
      created.push({ driverId: cd.driverId, fullName: cd.driver.fullName });
    }

    return NextResponse.json(
      { added: created.length, drivers: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding championship drivers:", error);
    return NextResponse.json(
      { error: "Failed to add championship drivers" },
      { status: 500 }
    );
  }
}
