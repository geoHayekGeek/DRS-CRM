import { NextRequest, NextResponse } from "next/server";
import { verifyTokenForEdge } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("auth-token");
  const token = cookie?.value || null;
  
  // Debug: Log token presence (remove in production)
  if (pathname === "/admin" && token) {
    console.log("[Middleware] Token found, verifying...");
  }
  
  const payload = token ? await verifyTokenForEdge(token) : null;
  const isAuthenticated = !!payload;
  
  // Debug: Log authentication status
  if (pathname === "/admin") {
    console.log("[Middleware] Path:", pathname, "Token present:", !!token, "Authenticated:", isAuthenticated);
  }

  if (pathname.startsWith("/api/admin")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
