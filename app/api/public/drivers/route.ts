import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
