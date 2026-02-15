import path from "path";

/**
 * Base directory for uploads. Use UPLOADS_DIR in production (e.g. Railway volume at /app/public/uploads)
 * so writes and reads use the same path.
 */
export function getUploadsDir(): string {
  const env = process.env.UPLOADS_DIR;
  if (env) return path.resolve(env);
  return path.join(process.cwd(), "public", "uploads");
}

/** Resolve a path under uploads (e.g. "rounds/id/file.jpg"). Rejects path traversal. */
export function resolveUploadPath(relativePath: string): string {
  const base = getUploadsDir();
  const resolved = path.resolve(base, path.normalize(relativePath));
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    throw new Error("Invalid path");
  }
  return resolved;
}

/** Convert URL path like /uploads/rounds/xxx/file.jpg to relative path rounds/xxx/file.jpg */
export function uploadUrlToRelative(urlPath: string): string {
  const prefix = "/uploads/";
  if (!urlPath.startsWith(prefix)) return urlPath.replace(/^\//, "");
  return urlPath.slice(prefix.length);
}
