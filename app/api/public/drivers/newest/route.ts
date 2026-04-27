import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noStoreJson } from "@/lib/http-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        fullName: true,
        age: true,
        height: true,
        profileImageUrl: true,
      },
    });

    return noStoreJson(drivers);
  } catch (error) {
    return noStoreJson(
      { error: "Failed to fetch newest drivers" },
      { status: 500 }
    );
  }
}
