import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { dailyKey, weeklyKey, monthlyKey } from "@/lib/game-engine/period";
import { rewardAmountForStreak, previousPeriodKey, RewardPeriodKind } from "@/lib/rewards";

const PERIOD_KEY: Record<RewardPeriodKind, string> = { DAILY: dailyKey(), WEEKLY: weeklyKey(), MONTHLY: monthlyKey() };
const TRANSACTION_TYPE: Record<RewardPeriodKind, "DAILY_REWARD" | "WEEKLY_REWARD" | "MONTHLY_REWARD"> = {
  DAILY: "DAILY_REWARD",
  WEEKLY: "WEEKLY_REWARD",
  MONTHLY: "MONTHLY_REWARD",
};

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const period = body?.period as RewardPeriodKind;
  if (!period || !PERIOD_KEY[period]) return NextResponse.json({ error: "Invalid period" }, { status: 400 });

  const periodKey = PERIOD_KEY[period];

  const existing = await prisma.rewardClaim.findUnique({
    where: { userId_period_periodKey: { userId: user.id, period, periodKey } },
  });
  if (existing) return NextResponse.json({ error: "Already claimed for this period" }, { status: 400 });

  const previous = await prisma.rewardClaim.findUnique({
    where: { userId_period_periodKey: { userId: user.id, period, periodKey: previousPeriodKey(period) } },
  });
  const streak = (previous?.streak ?? 0) + 1;
  const amount = rewardAmountForStreak(period, streak);

  const result = await prisma.$transaction(async (tx) => {
    await tx.rewardClaim.create({ data: { userId: user.id, period, periodKey, streak, amount } });

    const profile = await tx.profile.update({ where: { id: user.id }, data: { balance: { increment: amount } } });

    await tx.transaction.create({
      data: {
        userId: user.id,
        type: TRANSACTION_TYPE[period],
        amount,
        balanceAfter: profile.balance,
        description: `${period.charAt(0) + period.slice(1).toLowerCase()} reward — streak ${streak}`,
      },
    });

    return profile;
  });

  return NextResponse.json({ balance: Number(result.balance), amount, streak });
}
