import { rm } from "fs/promises";
import path from "path";
import { getUploadsDir } from "@/lib/uploads";

export async function cleanupDirectory(relativePath: string): Promise<void> {
  try {
    const underUploads = relativePath.replace(/^uploads[/\\]?/, "");
    const fullPath = path.join(getUploadsDir(), underUploads);
    await rm(fullPath, { recursive: true, force: true });
  } catch {
    // Directory may not exist or already deleted
  }
}
