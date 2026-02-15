import { NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "./auth";

export const ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
} as const;

export function requireSuperAdmin(request: Request): NextResponse | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Super Admin access required." },
      { status: 403 }
    );
  }

  return null;
}

export function requireAdminOrSuperAdmin(request: Request): NextResponse | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role !== "SUPER_ADMIN" && payload.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  return null;
}
