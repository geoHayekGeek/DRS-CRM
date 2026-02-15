import { NextRequest, NextResponse } from "next/server";
import { verifyTokenForEdge } from "./lib/auth";

function requiresSuperAdmin(pathname: string): boolean {
  if (pathname === "/admin/users" || pathname.startsWith("/admin/users/")) return true;
  if (pathname === "/api/admin/users" || pathname.startsWith("/api/admin/users/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("auth-token");
  const token = cookie?.value || null;

  const payload = token ? await verifyTokenForEdge(token) : null;
  const isAuthenticated = !!payload;
  const role = payload?.role ?? "ADMIN";

  if (pathname.startsWith("/api/admin")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (requiresSuperAdmin(pathname) && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Super Admin access required." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (requiresSuperAdmin(pathname) && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
