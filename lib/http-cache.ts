import { NextResponse } from "next/server";

/**
 * Prevent intermediary/browser caching for dynamic API payloads.
 * Useful behind CDNs/proxies where default caching behavior may vary by host.
 */
export function noStoreJson<T>(payload: T, init?: { status?: number }) {
  return NextResponse.json(payload, {
    status: init?.status,
    headers: {
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

