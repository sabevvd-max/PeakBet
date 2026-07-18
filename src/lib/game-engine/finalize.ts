import type { Game, PrismaClient } from "@prisma/client";
import { getLevelProgress, xpFromWager } from "@/lib/progression";
import { progressMissions, progressAchievements } from "./progression-engine";
import { updateLeaderboards } from "./leaderboard";
import { InsufficientBalanceError } from "./errors";

export type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export interface FinalizeParams {
  tx: TxClient;
  userId: string;
  game: Game;
  betAmount: number;
  payout: number;
  multiplier: number;
  isWin: boolean;
  resultJson: object;
  clientSeed: string;
  serverSeed: string;
  nonce: number;
  profileXpBefore: number;
  /** false when the bet was already deducted earlier (session-based games settling later). */
  deductBet: boolean;
}

export interface FinalizeResult {
  roundId: string;
  balance: number;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  unlockedAchievements: { name: string; icon: string; xpReward: number; coinReward: number }[];
}

const LEVEL_UP_BONUS_PER_LEVEL = 250;

/**
 * Shared settlement core used by both single-shot games (bet-service) and
 * multi-step sessions (session-service) once an outcome is known: moves the
 * ledger, grants XP/levels, updates stats/missions/achievements/leaderboards.
 */
export async function finalizeRound(params: FinalizeParams): Promise<FinalizeResult> {
  const { tx, userId, game, betAmount, payout, multiplier, isWin, resultJson, clientSeed, serverSeed, nonce } = params;
  const netChange = payout - betAmount;

  if (params.deductBet) {
    const decremented = await tx.profile.updateMany({
      where: { id: userId, balance: { gte: betAmount } },
      data: { balance: { decrement: betAmount } },
    });
    if (decremented.count === 0) throw new InsufficientBalanceError();
  }

  if (payout > 0) {
    await tx.profile.update({ where: { id: userId }, data: { balance: { increment: payout } } });
  }

  const round = await tx.gameRound.create({
    data: { userId, gameId: game.id, betAmount, payout, multiplier, result: resultJson, isWin, clientSeed, serverSeed, nonce },
  });

  const profileAfterBet = await tx.profile.findUniqueOrThrow({ where: { id: userId } });

  await tx.transaction.create({
    data: {
      userId,
      type: isWin ? "PAYOUT" : "BET",
      amount: netChange,
      balanceAfter: profileAfterBet.balance,
      gameRoundId: round.id,
      description: `${game.name} — bet ${betAmount}, payout ${payout}`,
    },
  });

  const xpGained = xpFromWager(betAmount) + (isWin ? Math.round(xpFromWager(betAmount) * 0.5) : 0);
  const beforeLevel = getLevelProgress(params.profileXpBefore);
  const afterLevel = getLevelProgress(params.profileXpBefore + xpGained);
  const leveledUp = afterLevel.level > beforeLevel.level;
  const levelUpBonus = leveledUp ? (afterLevel.level - beforeLevel.level) * LEVEL_UP_BONUS_PER_LEVEL : 0;

  await tx.profile.update({
    where: { id: userId },
    data: {
      xp: { increment: xpGained },
      level: afterLevel.level,
      ...(levelUpBonus > 0 && { balance: { increment: levelUpBonus } }),
    },
  });

  if (levelUpBonus > 0) {
    await tx.transaction.create({
      data: {
        userId,
        type: "LEVEL_UP_BONUS",
        amount: levelUpBonus,
        balanceAfter: Number(profileAfterBet.balance) + levelUpBonus,
        description: `Reached level ${afterLevel.level}`,
      },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "SYSTEM",
        title: `Level ${afterLevel.level} reached!`,
        message: `You've been awarded ${levelUpBonus} bonus demo coins.`,
      },
    });
  }

  const previousStats = await tx.userStatistics.findUnique({ where: { userId } });
  const newCurrentStreak = isWin ? (previousStats?.currentWinStreak ?? 0) + 1 : 0;

  const stats = await tx.userStatistics.upsert({
    where: { userId },
    create: {
      userId,
      totalWagered: betAmount,
      totalPayout: payout,
      gamesPlayed: 1,
      gamesWon: isWin ? 1 : 0,
      biggestWin: payout,
      biggestMultiplier: multiplier,
      currentWinStreak: newCurrentStreak,
      bestWinStreak: newCurrentStreak,
    },
    update: {
      totalWagered: { increment: betAmount },
      totalPayout: { increment: payout },
      gamesPlayed: { increment: 1 },
      gamesWon: isWin ? { increment: 1 } : undefined,
      biggestWin: Math.max(Number(previousStats?.biggestWin ?? 0), payout),
      biggestMultiplier: Math.max(Number(previousStats?.biggestMultiplier ?? 0), multiplier),
      currentWinStreak: newCurrentStreak,
      bestWinStreak: Math.max(previousStats?.bestWinStreak ?? 0, newCurrentStreak),
    },
  });

  await tx.game.update({ where: { id: game.id }, data: { playCount: { increment: 1 } } });

  const progressCtx = {
    userId,
    betAmount,
    payout,
    isWin,
    payoutMultiplier: multiplier,
    gamesPlayedTotal: stats.gamesPlayed,
    wageredTotal: Number(stats.totalWagered),
  };

  await progressMissions(tx, progressCtx);
  const unlockedAchievements = await progressAchievements(tx, progressCtx);

  let bonusBalance = 0;
  for (const achievement of unlockedAchievements) {
    const coinReward = Number(achievement.coinReward);
    bonusBalance += coinReward;
    if (coinReward > 0) {
      await tx.profile.update({
        where: { id: userId },
        data: { balance: { increment: coinReward }, xp: { increment: achievement.xpReward } },
      });
      await tx.transaction.create({
        data: {
          userId,
          type: "ACHIEVEMENT_REWARD",
          amount: coinReward,
          balanceAfter: Number(profileAfterBet.balance) + levelUpBonus + bonusBalance,
          description: `Achievement unlocked: ${achievement.name}`,
        },
      });
    }
    await tx.notification.create({
      data: {
        userId,
        type: "ACHIEVEMENT",
        title: `Achievement unlocked: ${achievement.name}`,
        message: coinReward > 0 ? `+${coinReward} demo coins, +${achievement.xpReward} XP` : `+${achievement.xpReward} XP`,
      },
    });
  }

  await updateLeaderboards(tx, userId, betAmount, netChange);

  const closingProfile = await tx.profile.findUniqueOrThrow({ where: { id: userId } });

  return {
    roundId: round.id,
    balance: Number(closingProfile.balance),
    xpGained,
    leveledUp,
    newLevel: afterLevel.level,
    unlockedAchievements: unlockedAchievements.map((a) => ({
      name: a.name,
      icon: a.icon,
      xpReward: a.xpReward,
      coinReward: Number(a.coinReward),
    })),
  };
}
