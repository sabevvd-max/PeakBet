import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { dailyKey, weeklyKey, monthlyKey } from "@/lib/game-engine/period";
import { rewardAmountForStreak, previousPeriodKey, RewardPeriodKind } from "@/lib/rewards";

const PERIOD_KEY: Record<RewardPeriodKind, string> = { DAILY: dailyKey(), WEEKLY: weeklyKey(), MONTHLY: monthlyKey() };

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const results: Record<string, { claimed: boolean; streak: number; nextAmount: number }> = {};

  for (const period of ["DAILY", "WEEKLY", "MONTHLY"] as RewardPeriodKind[]) {
    const periodKey = PERIOD_KEY[period];
    const [current, previous] = await Promise.all([
      prisma.rewardClaim.findUnique({ where: { userId_period_periodKey: { userId: user.id, period, periodKey } } }),
      prisma.rewardClaim.findUnique({
        where: { userId_period_periodKey: { userId: user.id, period, periodKey: previousPeriodKey(period) } },
      }),
    ]);

    const nextStreak = current ? current.streak : (previous?.streak ?? 0) + 1;
    results[period] = {
      claimed: !!current,
      streak: current?.streak ?? nextStreak,
      nextAmount: rewardAmountForStreak(period, nextStreak),
    };
  }

  return NextResponse.json({ rewards: results });
}
