import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  request: NextRequest,
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
    const etag = `"${statResult.size}-${Math.floor(statResult.mtimeMs)}"`;
    const ifNoneMatch = request.headers.get("if-none-match");

    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Last-Modified": statResult.mtime.toUTCString(),
          "Cache-Control": "public, no-cache, max-age=0, must-revalidate",
        },
      });
    }

    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        ETag: etag,
        "Last-Modified": statResult.mtime.toUTCString(),
        "Cache-Control": "public, no-cache, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
