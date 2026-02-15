import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { db } from "./db";
import { verifyPassword } from "./password";
import { validateEnv } from "./env";

validateEnv();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "auth-token";

export interface AuthResult {
  success: boolean;
  token?: string;
  error?: string;
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    };
  }

  const admin = await db.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!admin) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  const isValid = await verifyPassword(password, admin.passwordHash);

  if (!isValid) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  const token = jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "drs-cup-2026",
    }
  );

  return {
    success: true,
    token,
  };
}

export type Role = "SUPER_ADMIN" | "ADMIN";

export interface TokenPayload {
  sub: string;
  email: string;
  role?: Role;
}

// For Node.js runtime (API routes)
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!JWT_SECRET) {
      console.error("[Auth] JWT_SECRET is not defined");
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "drs-cup-2026",
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    // Log the error for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.error("[Auth] Token verification failed:", error instanceof Error ? error.message : "Unknown error");
    }
    return null;
  }
}

// For Edge Runtime (middleware) - uses Web Crypto API
export async function verifyTokenForEdge(token: string): Promise<TokenPayload | null> {
  try {
    if (!JWT_SECRET) {
      console.error("[Auth] JWT_SECRET is not defined");
      return null;
    }
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "drs-cup-2026",
    });
    
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as Role) ?? "ADMIN",
    };
  } catch (error) {
    // Log the error for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.error("[Auth] Token verification failed (Edge):", error instanceof Error ? error.message : "Unknown error");
    }
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);

  return cookies[COOKIE_NAME] || null;
}

export function getCookieConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = 60 * 60 * 24 * 7;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    domain: undefined,
  };
}
