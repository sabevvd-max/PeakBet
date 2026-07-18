import { Prisma, PrismaClient } from "@prisma/client";
import { dailyKey, weeklyKey, monthlyKey } from "./period";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export interface RoundContext {
  userId: string;
  betAmount: number;
  payout: number;
  isWin: boolean;
  payoutMultiplier: number;
  gamesPlayedTotal: number;
  wageredTotal: number;
}

/** Progress increment contributed by this round, per metric key. Missions/achievements declare which metric they track via their `key` prefix. */
function metricDelta(metric: string, ctx: RoundContext): number {
  switch (metric) {
    case "games":
      return 1;
    case "wager":
      return Math.round(ctx.betAmount);
    case "wins":
      return ctx.isWin ? 1 : 0;
    case "bigwin":
      return ctx.payoutMultiplier >= 10 ? 1 : 0;
    default:
      return 0;
  }
}

function metricOf(key: string): string {
  if (key.includes("wager")) return "wager";
  if (key.includes("bigwin")) return "bigwin";
  if (key.includes("wins")) return "wins";
  if (key.includes("games")) return "games";
  return "games";
}

/** Advances daily/weekly/monthly mission progress for the round just played, claim-independent. */
export async function progressMissions(tx: TxClient, ctx: RoundContext) {
  const periodByType = { DAILY: dailyKey(), WEEKLY: weeklyKey(), MONTHLY: monthlyKey() } as const;
  const missions = await tx.mission.findMany({ where: { active: true } });

  for (const mission of missions) {
    const delta = metricDelta(metricOf(mission.key), ctx);
    if (delta <= 0) continue;

    const periodKey = periodByType[mission.period];
    const existing = await tx.userMission.findUnique({
      where: { userId_missionId_periodKey: { userId: ctx.userId, missionId: mission.id, periodKey } },
    });

    if (existing?.completed) continue;

    const newProgress = Math.min(mission.goal, (existing?.progress ?? 0) + delta);
    await tx.userMission.upsert({
      where: { userId_missionId_periodKey: { userId: ctx.userId, missionId: mission.id, periodKey } },
      create: { userId: ctx.userId, missionId: mission.id, periodKey, progress: newProgress, completed: newProgress >= mission.goal },
      update: { progress: newProgress, completed: newProgress >= mission.goal },
    });
  }
}

/** Advances achievement progress and auto-unlocks ones that reach their goal. Returns newly unlocked achievements. */
export async function progressAchievements(tx: TxClient, ctx: RoundContext) {
  const achievements = await tx.achievement.findMany();
  const unlocked: { name: string; icon: string; xpReward: number; coinReward: Prisma.Decimal }[] = [];

  for (const achievement of achievements) {
    const metric = metricOf(achievement.key);
    let value = 0;
    if (metric === "wager") value = ctx.wageredTotal;
    else if (metric === "games") value = ctx.gamesPlayedTotal;
    else if (metric === "bigwin") value = ctx.payoutMultiplier >= 10 ? 1 : 0;
    else if (metric === "wins") value = ctx.isWin ? 1 : 0;
    else continue;

    const existing = await tx.userAchievement.findUnique({
      where: { userId_achievementId: { userId: ctx.userId, achievementId: achievement.id } },
    });
    if (existing?.unlockedAt) continue;

    const cumulative = metric === "wager" || metric === "games" ? value : (existing?.progress ?? 0) + value;
    const reached = cumulative >= achievement.goal;

    await tx.userAchievement.upsert({
      where: { userId_achievementId: { userId: ctx.userId, achievementId: achievement.id } },
      create: {
        userId: ctx.userId,
        achievementId: achievement.id,
        progress: Math.min(cumulative, achievement.goal),
        unlockedAt: reached ? new Date() : null,
      },
      update: {
        progress: Math.min(cumulative, achievement.goal),
        unlockedAt: reached ? new Date() : undefined,
      },
    });

    if (reached && !existing?.unlockedAt) {
      unlocked.push({
        name: achievement.name,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        coinReward: achievement.coinReward,
      });
    }
  }

  return unlocked;
}
