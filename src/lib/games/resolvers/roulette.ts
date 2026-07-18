import { floatFromSeed, intInRange } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export type RouletteBetType =
  | "straight"
  | "split"
  | "street"
  | "corner"
  | "red"
  | "black"
  | "odd"
  | "even"
  | "low"
  | "high"
  | "dozen1"
  | "dozen2"
  | "dozen3"
  | "column1"
  | "column2"
  | "column3";

export interface RouletteBet {
  type: RouletteBetType;
  numbers?: number[]; // required for straight/split/street/corner
  amount: number;
}

export interface RoulettePayload {
  bets: RouletteBet[];
  american?: boolean;
}

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const PAYOUT_RATIO: Record<RouletteBetType, number> = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  red: 1,
  black: 1,
  odd: 1,
  even: 1,
  low: 1,
  high: 1,
  dozen1: 2,
  dozen2: 2,
  dozen3: 2,
  column1: 2,
  column2: 2,
  column3: 2,
};

function pocketColor(n: number): "red" | "black" | "green" {
  if (n === 0 || n === -1) return "green"; // -1 represents American double-zero
  return RED_NUMBERS.has(n) ? "red" : "black";
}

function betWins(bet: RouletteBet, winningNumber: number): boolean {
  if (winningNumber < 0 && bet.type !== "straight") return false; // 00 only hits straight-up bets on 00

  switch (bet.type) {
    case "straight":
      return bet.numbers?.includes(winningNumber) ?? false;
    case "split":
    case "street":
    case "corner":
      return bet.numbers?.includes(winningNumber) ?? false;
    case "red":
      return pocketColor(winningNumber) === "red";
    case "black":
      return pocketColor(winningNumber) === "black";
    case "odd":
      return winningNumber > 0 && winningNumber % 2 === 1;
    case "even":
      return winningNumber > 0 && winningNumber % 2 === 0;
    case "low":
      return winningNumber >= 1 && winningNumber <= 18;
    case "high":
      return winningNumber >= 19 && winningNumber <= 36;
    case "dozen1":
      return winningNumber >= 1 && winningNumber <= 12;
    case "dozen2":
      return winningNumber >= 13 && winningNumber <= 24;
    case "dozen3":
      return winningNumber >= 25 && winningNumber <= 36;
    case "column1":
      return winningNumber > 0 && winningNumber % 3 === 1;
    case "column2":
      return winningNumber > 0 && winningNumber % 3 === 2;
    case "column3":
      return winningNumber > 0 && winningNumber % 3 === 0;
    default:
      return false;
  }
}

export function resolveRoulette(
  payload: RoulettePayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ winningNumber: number; pocketColor: string; results: { bet: RouletteBet; won: boolean; payout: number }[] }> {
  if (!payload.bets?.length) throw new InvalidBetError("Place at least one bet");

  const totalStaked = payload.bets.reduce((sum, b) => sum + b.amount, 0);
  if (Math.abs(totalStaked - betAmount) > 0.01) {
    throw new InvalidBetError("Bet amount must equal the sum of all placed bets");
  }

  const pocketCount = payload.american ? 38 : 37;
  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const raw = intInRange(float, 0, pocketCount - 1);
  // American wheel: 0..36 plus one extra pocket represented as -1 ("00").
  const winningNumber = payload.american && raw === 37 ? -1 : raw;

  let totalPayout = 0;
  const results = payload.bets.map((bet) => {
    const won = betWins(bet, winningNumber);
    const payout = won ? bet.amount * (PAYOUT_RATIO[bet.type] + 1) : 0;
    totalPayout += payout;
    return { bet, won, payout };
  });

  return {
    payout: totalPayout,
    multiplier: betAmount > 0 ? totalPayout / betAmount : 0,
    isWin: totalPayout > 0,
    result: { winningNumber, pocketColor: pocketColor(winningNumber), results },
  };
}
