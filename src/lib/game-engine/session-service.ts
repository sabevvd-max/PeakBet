import { prisma } from "@/lib/prisma";
import { generateServerSeed, generateClientSeed } from "./rng";
import { finalizeRound } from "./finalize";
import { BannedUserError, GameNotFoundError, InsufficientBalanceError, InvalidBetError } from "./errors";

/** Starts a multi-step session game (Mines, Dragon Tower, Blackjack): deducts the bet immediately and opens a tracked session. */
export async function startSession(params: { userId: string; gameSlug: string; betAmount: number; initialState: object }) {
  const { userId, gameSlug, betAmount, initialState } = params;

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

  const serverSeed = generateServerSeed();
  const clientSeed = generateClientSeed();

  const session = await prisma.$transaction(async (tx) => {
    const decremented = await tx.profile.updateMany({
      where: { id: userId, balance: { gte: betAmount } },
      data: { balance: { decrement: betAmount } },
    });
    if (decremented.count === 0) throw new InsufficientBalanceError();

    return tx.gameSession.create({
      data: { userId, gameSlug, betAmount, serverSeed, clientSeed, state: initialState, status: "ACTIVE" },
    });
  });

  const balance = await prisma.profile.findUniqueOrThrow({ where: { id: userId } });
  return { session, balance: Number(balance.balance) };
}

export async function getActiveSession(userId: string, sessionId: string) {
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new GameNotFoundError();
  if (session.status !== "ACTIVE") throw new InvalidBetError("Session already settled");
  return session;
}

export async function updateSessionState(sessionId: string, state: object) {
  return prisma.gameSession.update({ where: { id: sessionId }, data: { state } });
}

/** Deducts an additional bet-sized stake from the player and doubles the session's tracked bet (Blackjack "Double Down"). */
export async function doubleDownBet(userId: string, sessionId: string) {
  const session = await getActiveSession(userId, sessionId);
  const extraStake = Number(session.betAmount);

  return prisma.$transaction(async (tx) => {
    const decremented = await tx.profile.updateMany({
      where: { id: userId, balance: { gte: extraStake } },
      data: { balance: { decrement: extraStake } },
    });
    if (decremented.count === 0) throw new InsufficientBalanceError();

    return tx.gameSession.update({ where: { id: sessionId }, data: { betAmount: extraStake * 2 } });
  });
}

/** Ends an active session with a final outcome (win/loss/cashout) and runs full settlement. */
export async function settleSession(params: {
  userId: string;
  sessionId: string;
  payout: number;
  multiplier: number;
  isWin: boolean;
  resultJson: object;
}) {
  const { userId, sessionId, payout, multiplier, isWin, resultJson } = params;

  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new GameNotFoundError();
  if (session.status !== "ACTIVE") throw new InvalidBetError("Session already settled");

  const game = await prisma.game.findUnique({ where: { slug: session.gameSlug } });
  if (!game) throw new GameNotFoundError();

  const profile = await prisma.profile.findUniqueOrThrow({ where: { id: userId } });

  const result = await prisma.$transaction(async (tx) => {
    await tx.gameSession.update({ where: { id: sessionId }, data: { status: "SETTLED" } });

    return finalizeRound({
      tx,
      userId,
      game,
      betAmount: Number(session.betAmount),
      payout: Math.max(0, Math.round(payout * 100) / 100),
      multiplier,
      isWin,
      resultJson,
      clientSeed: session.clientSeed,
      serverSeed: session.serverSeed,
      nonce: 0,
      profileXpBefore: profile.xp,
      deductBet: false,
    });
  });

  return result;
}
