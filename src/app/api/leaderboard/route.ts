import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dailyKey, weeklyKey, monthlyKey, allTimeKey } from "@/lib/game-engine/period";

const PERIOD_KEYS: Record<string, () => string> = {
  DAILY: dailyKey,
  WEEKLY: weeklyKey,
  MONTHLY: monthlyKey,
  ALL_TIME: allTimeKey,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "WEEKLY").toUpperCase();
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  if (!PERIOD_KEYS[period]) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const entries = await prisma.leaderboardEntry.findMany({
    where: { period: period as "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME", periodKey: PERIOD_KEYS[period]() },
    orderBy: { wagered: "desc" },
    take: limit,
    include: { profile: { select: { username: true, avatarUrl: true, level: true } } },
  });

  const leaderboard = entries.map((entry, i) => ({
    rank: i + 1,
    username: entry.profile.username,
    avatarUrl: entry.profile.avatarUrl,
    level: entry.profile.level,
    wagered: Number(entry.wagered),
    netProfit: Number(entry.netProfit),
  }));

  return NextResponse.json({ leaderboard, period });
}
