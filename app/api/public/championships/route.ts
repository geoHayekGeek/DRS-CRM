import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch championships" },
      { status: 500 }
    );
  }
}
