import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function getGroupLabels(count: number): string[] {
  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    labels.push(String.fromCharCode(65 + i));
  }
  return labels;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const roundId = params.id;
    const assignmentId = params.assignmentId;

    const round = await db.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    const assignment = await db.groupAssignment.findUnique({
      where: { id: assignmentId, roundId },
      include: { driver: { select: { id: true, fullName: true } } },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const sessions = await db.session.findMany({
      where: { roundId },
      select: { status: true, results: { take: 1, select: { id: true } } },
    });
    const isRoundCompleted =
      sessions.length > 0 &&
      sessions.every(
        (s) => s.status === "COMPLETED" || s.results.length > 0
      );

    if (isRoundCompleted) {
      return NextResponse.json(
        { error: "Cannot edit assignments when round is completed" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { kartNumber: rawKart, group: newGroup } = body;

    const updates: { kartNumber?: number; group?: string } = {};
    const groupLabels = getGroupLabels(round.numberOfGroups);

    if (newGroup !== undefined) {
      const group = typeof newGroup === "string" ? newGroup.trim() : "";
      if (!groupLabels.includes(group)) {
        return NextResponse.json(
          { error: `Invalid group. Must be one of: ${groupLabels.join(", ")}` },
          { status: 400 }
        );
      }
      updates.group = group;
    }

    if (rawKart !== undefined) {
      const kartNumber = typeof rawKart === "string" ? parseInt(rawKart, 10) : Number(rawKart);
      if (!Number.isInteger(kartNumber) || kartNumber < 1) {
        return NextResponse.json(
          { error: "Kart number must be an integer >= 1" },
          { status: 400 }
        );
      }
      updates.kartNumber = kartNumber;
    }

    const targetGroup = updates.group ?? assignment.group;

    if (updates.kartNumber !== undefined) {
      const duplicate = await db.groupAssignment.findFirst({
        where: {
          roundId,
          group: targetGroup,
          kartNumber: updates.kartNumber,
          id: { not: assignmentId },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Another driver in this group already has this kart number" },
          { status: 400 }
        );
      }
    }

    if (updates.group !== undefined) {
      const kartConflict = await db.groupAssignment.findFirst({
        where: {
          roundId,
          group: updates.group,
          kartNumber: assignment.kartNumber,
          id: { not: assignmentId },
        },
      });
      if (kartConflict) {
        return NextResponse.json(
          { error: "Target group already has a driver with this kart number" },
          { status: 400 }
        );
      }
    }

    const updated = await db.groupAssignment.update({
      where: { id: assignmentId },
      data: updates,
      include: {
        driver: {
          select: { id: true, fullName: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
