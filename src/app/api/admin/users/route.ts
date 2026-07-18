import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const users = await prisma.profile.findMany({
    where: query ? { OR: [{ username: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      role: true,
      balance: true,
      level: true,
      xp: true,
      isBanned: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({ ...u, balance: Number(u.balance), createdAt: u.createdAt.toISOString(), lastLoginAt: u.lastLoginAt?.toISOString() ?? null })),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const target = await prisma.profile.findUnique({ where: { id: body.userId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updates: { isBanned?: boolean; role?: "USER" | "ADMIN"; balance?: { increment: number } } = {};

  if (typeof body.isBanned === "boolean") updates.isBanned = body.isBanned;
  if (body.role === "USER" || body.role === "ADMIN") updates.role = body.role;

  if (typeof body.balanceAdjustment === "number" && body.balanceAdjustment !== 0) {
    updates.balance = { increment: body.balanceAdjustment };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.update({ where: { id: body.userId }, data: updates });

    if (typeof body.balanceAdjustment === "number" && body.balanceAdjustment !== 0) {
      await tx.transaction.create({
        data: {
          userId: body.userId,
          type: "ADMIN_ADJUSTMENT",
          amount: body.balanceAdjustment,
          balanceAfter: profile.balance,
          description: `Admin balance adjustment by ${admin.username}`,
        },
      });
    }

    return profile;
  });

  await logAdminAction(admin.id, "update_user", body.userId, {
    isBanned: updates.isBanned,
    role: updates.role,
    balanceAdjustment: body.balanceAdjustment,
  });

  return NextResponse.json({ user: { ...updated, balance: Number(updated.balance) } });
}
