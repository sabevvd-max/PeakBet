import { floatFromSeed } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";
import { generateCrashPoint } from "./crash-math";

export interface LimboPayload {
  targetMultiplier: number;
}

export function resolveLimbo(
  payload: LimboPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ crashPoint: number; targetMultiplier: number }> {
  const target = payload.targetMultiplier;
  if (!Number.isFinite(target) || target < 1.01) throw new InvalidBetError("Target multiplier must be at least 1.01x");

  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const crashPoint = generateCrashPoint(float);
  const isWin = crashPoint >= target;

  return {
    payout: isWin ? betAmount * target : 0,
    multiplier: isWin ? target : 0,
    isWin,
    result: { crashPoint, targetMultiplier: target },
  };
}
