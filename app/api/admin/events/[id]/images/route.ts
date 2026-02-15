import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

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
    const eventId = params.id;
    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
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
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "events",
      eventId,
      "gallery"
    );
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const imagePath = `/uploads/events/${eventId}/gallery/${filename}`;
    const eventImage = await db.eventImage.create({
      data: { eventId, imagePath },
    });

    return NextResponse.json({
      id: eventImage.id,
      imagePath: eventImage.imagePath,
      createdAt: eventImage.createdAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
