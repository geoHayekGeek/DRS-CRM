import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { db } from "@/lib/db";
import { resolveUploadPath, uploadUrlToRelative } from "@/lib/uploads";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { imageId } = params;
    const eventImage = await db.eventImage.findUnique({
      where: { id: imageId },
    });

    if (!eventImage) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const filePath = resolveUploadPath(uploadUrlToRelative(eventImage.imagePath));
    try {
      await unlink(filePath);
    } catch {
      // File may already be missing; continue to delete record
    }

    await db.eventImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
