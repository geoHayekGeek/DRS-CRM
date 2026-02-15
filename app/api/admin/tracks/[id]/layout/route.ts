import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { getUploadsDir, resolveUploadPath, uploadUrlToRelative } from "@/lib/uploads";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = params.id;
    const track = await db.track.findUnique({ where: { id: trackId } });
    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const mime = file.type;
    if (!ALLOWED_TYPES.includes(mime as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, or WebP." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const ext = MIME_TO_EXT[mime] || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(getUploadsDir(), "tracks", trackId);
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/tracks/${trackId}/${filename}`;
    
    if (track.layoutImageUrl) {
      const oldFilePath = resolveUploadPath(uploadUrlToRelative(track.layoutImageUrl));
      try {
        await unlink(oldFilePath);
      } catch {
        // Old file may not exist
      }
    }

    await db.track.update({
      where: { id: trackId },
      data: { layoutImageUrl: url },
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
