import { floatsFromSeed, shuffleWithFloats } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export interface KenoPayload {
  picks: number[]; // 1..10 numbers from 1..40
}

const POOL_SIZE = 40;
const DRAW_SIZE = 10;

/** matches -> multiplier, keyed by number of picks. Generated so bigger picks/hits pay exponentially more. */
function payoutFor(picksCount: number, matches: number): number {
  const minToWin = Math.ceil(picksCount * 0.3);
  if (matches < minToWin) return 0;
  const ratio = matches / picksCount;
  return Math.round(Math.pow(ratio, 3) * picksCount * 2.4 * 100) / 100;
}

export function resolveKeno(
  payload: KenoPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ picks: number[]; draw: number[]; matches: number[] }> {
  const picks = [...new Set(payload.picks)];
  if (picks.length < 1 || picks.length > 10) throw new InvalidBetError("Pick between 1 and 10 numbers");
  if (picks.some((n) => n < 1 || n > POOL_SIZE)) throw new InvalidBetError(`Numbers must be between 1 and ${POOL_SIZE}`);

  const pool = Array.from({ length: POOL_SIZE }, (_, i) => i + 1);
  const floats = floatsFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce, POOL_SIZE);
  const shuffled = shuffleWithFloats(pool, floats);
  const draw = shuffled.slice(0, DRAW_SIZE);

  const matches = picks.filter((p) => draw.includes(p));
  const multiplier = payoutFor(picks.length, matches.length);
  const isWin = multiplier > 0;

  return {
    payout: betAmount * multiplier,
    multiplier,
    isWin,
    result: { picks, draw, matches },
  };
}
