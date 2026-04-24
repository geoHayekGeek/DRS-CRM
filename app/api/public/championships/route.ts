import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noStoreJson } from "@/lib/http-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const championships = await db.championship.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });
    const list = championships.map((c) => ({
      id: c.id,
      name: c.name,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate?.toISOString() ?? null,
    }));
    return noStoreJson(list);
  } catch (error) {
    return noStoreJson(
      { error: "Failed to fetch championships" },
      { status: 500 }
    );
  }
}
