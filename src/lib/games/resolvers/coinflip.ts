import { floatFromSeed } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export interface CoinFlipPayload {
  choice: "heads" | "tails";
}

const MULTIPLIER = 1.96;

export function resolveCoinFlip(
  payload: CoinFlipPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ outcome: "heads" | "tails"; choice: string }> {
  if (payload.choice !== "heads" && payload.choice !== "tails") throw new InvalidBetError("Invalid choice");

  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const outcome: "heads" | "tails" = float < 0.5 ? "heads" : "tails";
  const isWin = outcome === payload.choice;

  return {
    payout: isWin ? betAmount * MULTIPLIER : 0,
    multiplier: isWin ? MULTIPLIER : 0,
    isWin,
    result: { outcome, choice: payload.choice },
  };
}
