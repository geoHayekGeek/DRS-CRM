import { rm } from "fs/promises";
import path from "path";

export async function cleanupDirectory(relativePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), "public", relativePath);
    await rm(fullPath, { recursive: true, force: true });
  } catch {
    // Directory may not exist or already deleted
  }
}
