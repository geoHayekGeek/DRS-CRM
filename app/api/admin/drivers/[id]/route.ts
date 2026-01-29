import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driver = await db.driver.findUnique({
      where: { id: params.id },
      include: {
        sessionResults: {
          include: {
            session: {
              include: {
                round: {
                  include: {
                    championship: true,
                    track: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    const sessionResults = [...driver.sessionResults].sort((a, b) => {
      const dateA = a.session.round.date.getTime();
      const dateB = b.session.round.date.getTime();
      if (dateB !== dateA) return dateB - dateA;
      return a.session.order - b.session.order;
    });

    return NextResponse.json({
      ...driver,
      sessionResults,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch driver" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fullName, profileImageUrl, weight, height, notes } = body;

    const existingDriver = await db.driver.findUnique({
      where: { id: params.id },
    });

    if (!existingDriver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

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

    const driver = await db.driver.update({
      where: { id: params.id },
      data: {
        fullName: fullName.trim(),
        profileImageUrl: profileImageUrl?.trim() || null,
        weight: weight || null,
        height: height || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update driver" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingDriver = await db.driver.findUnique({
      where: { id: params.id },
    });

    if (!existingDriver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    await db.driver.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete driver" },
      { status: 500 }
    );
  }
}
