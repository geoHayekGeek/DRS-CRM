import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noStoreJson } from "@/lib/http-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        profileImageUrl: true,
        age: true,
        height: true,
      },
    });

    return noStoreJson(drivers);
  } catch (error) {
    return noStoreJson(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
