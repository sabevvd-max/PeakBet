import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stats = await prisma.userStatistics.findMany({
    orderBy: { totalWagered: "desc" },
    take: 25,
    include: { profile: { select: { username: true, avatarUrl: true, level: true, balance: true } } },
  });

  return NextResponse.json({
    players: stats.map((s) => ({
      username: s.profile.username,
      avatarUrl: s.profile.avatarUrl,
      level: s.profile.level,
      balance: Number(s.profile.balance),
      totalWagered: Number(s.totalWagered),
      totalPayout: Number(s.totalPayout),
      gamesPlayed: s.gamesPlayed,
      gamesWon: s.gamesWon,
    })),
  });
}
