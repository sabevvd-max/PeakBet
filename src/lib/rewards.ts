export type RewardPeriodKind = "DAILY" | "WEEKLY" | "MONTHLY";

const BASE_AMOUNT: Record<RewardPeriodKind, number> = { DAILY: 100, WEEKLY: 750, MONTHLY: 3000 };
const STREAK_CAP: Record<RewardPeriodKind, number> = { DAILY: 7, WEEKLY: 4, MONTHLY: 3 };

export function rewardAmountForStreak(period: RewardPeriodKind, streak: number): number {
  const cappedStreak = Math.min(streak, STREAK_CAP[period]);
  return BASE_AMOUNT[period] * cappedStreak;
}

/** The previous period's key, used to check if the streak continues. */
export function previousPeriodKey(period: RewardPeriodKind): string {
  const now = new Date();
  if (period === "DAILY") {
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return dailyKeyFor(yesterday);
  }
  if (period === "WEEKLY") {
    const lastWeek = new Date(now);
    lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
    return weeklyKeyFor(lastWeek);
  }
  const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return monthlyKeyFor(lastMonth);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dailyKeyFor(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function weeklyKeyFor(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad(weekNum)}`;
}

function monthlyKeyFor(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}
