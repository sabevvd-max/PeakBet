import { prisma } from "@/lib/prisma";
import { generateServerSeed, hashServerSeed, generateClientSeed } from "./rng";
import { finalizeRound } from "./finalize";
import { BannedUserError, GameNotFoundError, InsufficientBalanceError, InvalidBetError } from "./errors";

export interface ResolveOutcome<TResult = unknown> {
  payout: number;
  multiplier: number;
  isWin: boolean;
  result: TResult;
}

export interface PlayGameParams<TResult = unknown> {
  userId: string;
  gameSlug: string;
  betAmount: number;
  clientSeed?: string;
  /** Two-phase games (Hi-Lo, Video Poker) reveal info in phase 1 using a seed they must reuse when settling in phase 2. */
  serverSeed?: string;
  resolve: (ctx: { serverSeed: string; clientSeed: string; nonce: number }) => ResolveOutcome<TResult>;
}

export interface PlayGameResult<TResult = unknown> {
  roundId: string;
  betAmount: number;
  payout: number;
  multiplier: number;
  isWin: boolean;
  result: TResult;
  balance: number;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  fairness: { serverSeedHash: string; serverSeed: string; clientSeed: string; nonce: number };
  unlockedAchievements: { name: string; icon: string; xpReward: number; coinReward: number }[];
}

/** Single-request games: bet in, outcome resolved deterministically, settled atomically. */
export async function playGame<TResult = unknown>(params: PlayGameParams<TResult>): Promise<PlayGameResult<TResult>> {
  const { userId, gameSlug, betAmount } = params;

  if (!Number.isFinite(betAmount) || betAmount <= 0) {
    throw new InvalidBetError("Bet amount must be greater than zero");
  }

  const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
  if (!game) throw new GameNotFoundError();

  if (betAmount < Number(game.minBet) || betAmount > Number(game.maxBet)) {
    throw new InvalidBetError(`Bet must be between ${game.minBet} and ${game.maxBet}`);
  }

  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) throw new GameNotFoundError();
  if (profile.isBanned) throw new BannedUserError();
  if (Number(profile.balance) < betAmount) throw new InsufficientBalanceError();

  const serverSeed = params.serverSeed ?? generateServerSeed();
  const serverSeedHash = hashServerSeed(serverSeed);
  const clientSeed = params.clientSeed ?? generateClientSeed();
  const nonce = 0;

  const outcome = params.resolve({ serverSeed, clientSeed, nonce });
  const payout = Math.max(0, Math.round(outcome.payout * 100) / 100);

  const result = await prisma.$transaction((tx) =>
    finalizeRound({
      tx,
      userId,
      game,
      betAmount,
      payout,
      multiplier: outcome.multiplier,
      isWin: outcome.isWin,
      resultJson: outcome.result as object,
      clientSeed,
      serverSeed,
      nonce,
      profileXpBefore: profile.xp,
      deductBet: true,
    })
  );

  return {
    roundId: result.roundId,
    betAmount,
    payout,
    multiplier: outcome.multiplier,
    isWin: outcome.isWin,
    result: outcome.result,
    balance: result.balance,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    fairness: { serverSeedHash, serverSeed, clientSeed, nonce },
    unlockedAchievements: result.unlockedAchievements,
  };
}
