import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const days = 14;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const rounds = await prisma.gameRound.findMany({
    where: { createdAt: { gte: since } },
    select: { userId: true, createdAt: true },
  });

  const buckets = new Map<string, Set<string>>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    buckets.set(d.toISOString().slice(0, 10), new Set());
  }

  for (const round of rounds) {
    const key = round.createdAt.toISOString().slice(0, 10);
    buckets.get(key)?.add(round.userId);
  }

  const series = [...buckets.entries()].map(([date, users]) => ({ date, activeUsers: users.size }));

  return NextResponse.json({ series });
}
