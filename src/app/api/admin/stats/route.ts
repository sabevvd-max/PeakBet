import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { dailyKey } from "@/lib/game-engine/period";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [userCount, totalWageredAgg, totalPayoutAgg, roundsToday, activeToday, bannedCount, gamesCount, newUsersToday] = await Promise.all([
    prisma.profile.count(),
    prisma.userStatistics.aggregate({ _sum: { totalWagered: true } }),
    prisma.userStatistics.aggregate({ _sum: { totalPayout: true } }),
    prisma.gameRound.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.gameRound.findMany({ where: { createdAt: { gte: todayStart } }, distinct: ["userId"], select: { userId: true } }),
    prisma.profile.count({ where: { isBanned: true } }),
    prisma.game.count(),
    prisma.profile.count({ where: { createdAt: { gte: todayStart } } }),
  ]);

  const totalWagered = Number(totalWageredAgg._sum.totalWagered ?? 0);
  const totalPayout = Number(totalPayoutAgg._sum.totalPayout ?? 0);

  return NextResponse.json({
    userCount,
    newUsersToday,
    bannedCount,
    gamesCount,
    totalWagered,
    totalPayout,
    houseProfit: totalWagered - totalPayout,
    roundsToday,
    activeUsersToday: activeToday.length,
    periodKey: dailyKey(),
  });
}
