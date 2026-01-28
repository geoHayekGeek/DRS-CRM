import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const championships = await db.championship.findMany({
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(championships);
  } catch (error) {
    console.error("Error fetching championships:", error);
    return NextResponse.json(
      { error: "Failed to fetch championships" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isCurrent, startDate, endDate } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Championship name is required" },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid start date format" },
        { status: 400 }
      );
    }

    let end: Date | null = null;
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date format" },
          { status: 400 }
        );
      }
      if (end < start) {
        return NextResponse.json(
          { error: "End date must be after or equal to start date" },
          { status: 400 }
        );
      }
    }

    const isCurrentBool = typeof isCurrent === "boolean" ? isCurrent : false;

    const championship = await db.championship.create({
      data: {
        name: name.trim(),
        isCurrent: isCurrentBool,
        startDate: start,
        endDate: end,
      },
    });

    return NextResponse.json(championship, { status: 201 });
  } catch (error) {
    console.error("Error creating championship:", error);
    return NextResponse.json(
      { error: "Failed to create championship" },
      { status: 500 }
    );
  }
}
