import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { db } from "@/lib/db";
import { resolveUploadPath, uploadUrlToRelative } from "@/lib/uploads";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const imageId = params.imageId;
    const roundImage = await db.roundImage.findUnique({
      where: { id: imageId },
    });

    if (!roundImage) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const filePath = resolveUploadPath(uploadUrlToRelative(roundImage.imageUrl));
    try {
      await unlink(filePath);
    } catch {
      // File may already be missing; continue to delete record
    }

    await db.roundImage.delete({
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
