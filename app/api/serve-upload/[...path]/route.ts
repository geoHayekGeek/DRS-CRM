import { NextRequest, NextResponse } from "next/server";
import { createReadStream, stat } from "fs/promises";
import path from "path";
import { resolveUploadPath } from "@/lib/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path;
    if (!pathSegments?.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const relativePath = pathSegments.join("/");
    const filePath = resolveUploadPath(relativePath);
    const statResult = await stat(filePath);
    if (!statResult.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const stream = createReadStream(filePath);
    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
