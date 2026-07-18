import { floatFromSeed } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";
import { generateCrashPoint } from "./crash-math";

export interface CrashPayload {
  cashoutMultiplier: number;
}

export function resolveCrash(
  payload: CrashPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ crashPoint: number; cashoutMultiplier: number }> {
  const cashout = payload.cashoutMultiplier;
  if (!Number.isFinite(cashout) || cashout < 1.01) throw new InvalidBetError("Cashout multiplier must be at least 1.01x");

  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const crashPoint = generateCrashPoint(float);
  const isWin = crashPoint >= cashout;

  return {
    payout: isWin ? betAmount * cashout : 0,
    multiplier: isWin ? cashout : 0,
    isWin,
    result: { crashPoint, cashoutMultiplier: cashout },
  };
}
