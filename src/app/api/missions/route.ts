import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { dailyKey, weeklyKey, monthlyKey } from "@/lib/game-engine/period";

const PERIOD_KEY: Record<string, string> = { DAILY: dailyKey(), WEEKLY: weeklyKey(), MONTHLY: monthlyKey() };

export async function GET() {
  const missions = await prisma.mission.findMany({ where: { active: true }, orderBy: { goal: "asc" } });
  const user = await requireUser();

  let progressMap = new Map<string, { progress: number; completed: boolean; claimedAt: Date | null }>();
  if (user) {
    const userMissions = await prisma.userMission.findMany({
      where: {
        userId: user.id,
        OR: Object.entries(PERIOD_KEY).map(([period, periodKey]) => ({ periodKey, mission: { period: period as "DAILY" | "WEEKLY" | "MONTHLY" } })),
      },
    });
    progressMap = new Map(userMissions.map((um) => [um.missionId, { progress: um.progress, completed: um.completed, claimedAt: um.claimedAt }]));
  }

  const result = missions.map((m) => {
    const progress = progressMap.get(m.id);
    return {
      id: m.id,
      key: m.key,
      period: m.period,
      title: m.title,
      description: m.description,
      icon: m.icon,
      goal: m.goal,
      xpReward: m.xpReward,
      coinReward: Number(m.coinReward),
      progress: progress?.progress ?? 0,
      completed: progress?.completed ?? false,
      claimed: !!progress?.claimedAt,
    };
  });

  return NextResponse.json({ missions: result });
}
