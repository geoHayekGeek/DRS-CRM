import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, profileImageUrl, weight, height, notes } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (weight !== undefined && weight !== null) {
      if (typeof weight !== "number" || weight < 0) {
        return NextResponse.json(
          { error: "Weight must be a positive number" },
          { status: 400 }
        );
      }
    }

    if (height !== undefined && height !== null) {
      if (typeof height !== "number" || height < 0) {
        return NextResponse.json(
          { error: "Height must be a positive number" },
          { status: 400 }
        );
      }
    }

    const driver = await db.driver.create({
      data: {
        fullName: fullName.trim(),
        profileImageUrl: profileImageUrl?.trim() || null,
        weight: weight || null,
        height: height || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create driver" },
      { status: 500 }
    );
  }
}
