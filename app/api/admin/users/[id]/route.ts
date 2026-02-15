import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/role-guard";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const forbidden = requireSuperAdmin(request);
  if (forbidden) return forbidden;

  try {
    const user = await db.adminUser.findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete Super Admin" },
        { status: 403 }
      );
    }

    await db.adminUser.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
