import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        profileImageUrl: true,
        weight: true,
        height: true,
      },
    });

    return NextResponse.json(drivers, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
