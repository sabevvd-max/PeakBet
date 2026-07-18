import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { getLevelProgress, getRankForLevel } from "@/lib/progression";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [profile, stats, achievementCount, favoriteCount] = await Promise.all([
    prisma.profile.findUniqueOrThrow({ where: { id: user.id } }),
    prisma.userStatistics.findUnique({ where: { userId: user.id } }),
    prisma.userAchievement.count({ where: { userId: user.id, unlockedAt: { not: null } } }),
    prisma.favoriteGame.count({ where: { userId: user.id } }),
  ]);

  const levelProgress = getLevelProgress(profile.xp);
  const rank = getRankForLevel(levelProgress.level);

  return NextResponse.json({
    level: levelProgress,
    rank,
    stats: {
      totalWagered: Number(stats?.totalWagered ?? 0),
      totalPayout: Number(stats?.totalPayout ?? 0),
      gamesPlayed: stats?.gamesPlayed ?? 0,
      gamesWon: stats?.gamesWon ?? 0,
      winRate: stats && stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 1000) / 10 : 0,
      biggestWin: Number(stats?.biggestWin ?? 0),
      biggestMultiplier: Number(stats?.biggestMultiplier ?? 0),
      currentWinStreak: stats?.currentWinStreak ?? 0,
      bestWinStreak: stats?.bestWinStreak ?? 0,
    },
    achievementCount,
    favoriteCount,
    memberSince: profile.createdAt.toISOString(),
  });
}
