import { floatFromSeed, intInRange } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export interface DicePayload {
  target: number; // 2..98
  direction: "over" | "under";
}

export interface DiceResult {
  roll: number;
  target: number;
  direction: "over" | "under";
}

export function resolveDice(
  payload: DicePayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<DiceResult> {
  const target = Math.round(payload.target);
  if (target < 2 || target > 98) throw new InvalidBetError("Target must be between 2 and 98");
  if (payload.direction !== "over" && payload.direction !== "under") throw new InvalidBetError("Invalid direction");

  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const roll = intInRange(float, 0, 9999) / 100;

  const winChance = payload.direction === "under" ? target : 100 - target;
  const multiplier = Math.round((99 / winChance) * 10000) / 10000;
  const isWin = payload.direction === "under" ? roll < target : roll > target;

  return {
    payout: isWin ? betAmount * multiplier : 0,
    multiplier: isWin ? multiplier : 0,
    isWin,
    result: { roll, target, direction: payload.direction },
  };
}
