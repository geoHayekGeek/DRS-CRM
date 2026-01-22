import { NextResponse } from "next/server";
import { getCookieConfig } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  response.cookies.set("auth-token", "", {
    ...getCookieConfig(),
    maxAge: 0,
  });

  return response;
}
