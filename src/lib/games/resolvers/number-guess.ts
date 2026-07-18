import { floatFromSeed, intInRange } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export interface NumberGuessPayload {
  guess: number; // 1..100
}

function multiplierForDiff(diff: number): number {
  if (diff === 0) return 48;
  if (diff <= 2) return 5;
  if (diff <= 5) return 2;
  if (diff <= 10) return 1.2;
  return 0;
}

export function resolveNumberGuess(
  payload: NumberGuessPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ guess: number; draw: number; diff: number }> {
  const guess = Math.round(payload.guess);
  if (guess < 1 || guess > 100) throw new InvalidBetError("Guess must be between 1 and 100");

  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const draw = intInRange(float, 1, 100);
  const diff = Math.abs(guess - draw);
  const multiplier = multiplierForDiff(diff);

  return {
    payout: betAmount * multiplier,
    multiplier,
    isWin: multiplier > 0,
    result: { guess, draw, diff },
  };
}
