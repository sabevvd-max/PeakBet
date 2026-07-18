import { PrismaClient } from "@prisma/client";
import { dailyKey, weeklyKey, monthlyKey, allTimeKey } from "./period";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function updateLeaderboards(tx: TxClient, userId: string, wagered: number, netProfit: number) {
  const periods: { period: "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME"; periodKey: string }[] = [
    { period: "DAILY", periodKey: dailyKey() },
    { period: "WEEKLY", periodKey: weeklyKey() },
    { period: "MONTHLY", periodKey: monthlyKey() },
    { period: "ALL_TIME", periodKey: allTimeKey() },
  ];

  for (const { period, periodKey } of periods) {
    const existing = await tx.leaderboardEntry.findUnique({
      where: { userId_period_periodKey: { userId, period, periodKey } },
    });

    await tx.leaderboardEntry.upsert({
      where: { userId_period_periodKey: { userId, period, periodKey } },
      create: { userId, period, periodKey, wagered, netProfit },
      update: {
        wagered: (existing ? Number(existing.wagered) : 0) + wagered,
        netProfit: (existing ? Number(existing.netProfit) : 0) + netProfit,
      },
    });
  }
}
