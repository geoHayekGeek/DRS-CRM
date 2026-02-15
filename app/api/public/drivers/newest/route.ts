import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        fullName: true,
        weight: true,
        height: true,
        profileImageUrl: true,
      },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch newest drivers" },
      { status: 500 }
    );
  }
}
