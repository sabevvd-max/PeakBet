import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [achievements, unlocked] = await Promise.all([
    prisma.achievement.findMany({ orderBy: [{ type: "asc" }, { goal: "asc" }] }),
    prisma.userAchievement.findMany({ where: { userId: user.id } }),
  ]);

  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u]));

  const result = achievements.map((a) => {
    const progress = unlockedMap.get(a.id);
    return {
      id: a.id,
      key: a.key,
      type: a.type,
      name: a.name,
      description: a.description,
      icon: a.icon,
      tier: a.tier,
      goal: a.goal,
      xpReward: a.xpReward,
      coinReward: Number(a.coinReward),
      progress: progress?.progress ?? 0,
      unlockedAt: progress?.unlockedAt?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ achievements: result });
}
