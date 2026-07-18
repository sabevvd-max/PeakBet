import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { admin: { select: { username: true } } },
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      admin: l.admin.username,
      action: l.action,
      target: l.target,
      meta: l.meta,
      createdAt: l.createdAt.toISOString(),
    })),
  });
}
