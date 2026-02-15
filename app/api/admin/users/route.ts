import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requireSuperAdmin } from "@/lib/role-guard";

export async function GET(request: NextRequest) {
  const forbidden = requireSuperAdmin(request);
  if (forbidden) return forbidden;

  try {
    const users = await db.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const forbidden = requireSuperAdmin(request);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailTrimmed = email.toLowerCase().trim();

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await db.adminUser.findUnique({
      where: { email: emailTrimmed },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.adminUser.create({
      data: {
        email: emailTrimmed,
        name: name && typeof name === "string" ? name.trim() || null : null,
        passwordHash,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
