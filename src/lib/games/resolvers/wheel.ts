import { floatFromSeed, weightedPick } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export type WheelRisk = "low" | "medium" | "high";

interface Segment {
  multiplier: number;
  weight: number;
}

const WHEEL_SEGMENTS: Record<WheelRisk, Segment[]> = {
  low: [
    { multiplier: 1.2, weight: 30 },
    { multiplier: 1.5, weight: 25 },
    { multiplier: 2, weight: 20 },
    { multiplier: 3, weight: 15 },
    { multiplier: 5, weight: 8 },
    { multiplier: 10, weight: 2 },
  ],
  medium: [
    { multiplier: 0, weight: 20 },
    { multiplier: 1.5, weight: 25 },
    { multiplier: 2, weight: 20 },
    { multiplier: 3, weight: 15 },
    { multiplier: 5, weight: 12 },
    { multiplier: 10, weight: 6 },
    { multiplier: 20, weight: 2 },
  ],
  high: [
    { multiplier: 0, weight: 45 },
    { multiplier: 2, weight: 20 },
    { multiplier: 3, weight: 15 },
    { multiplier: 5, weight: 10 },
    { multiplier: 10, weight: 6 },
    { multiplier: 20, weight: 3 },
    { multiplier: 50, weight: 1 },
  ],
};

export function wheelSegments(risk: WheelRisk): Segment[] {
  return WHEEL_SEGMENTS[risk];
}

export interface WheelPayload {
  risk: WheelRisk;
}

export function resolveWheel(
  payload: WheelPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ segmentIndex: number; multiplier: number }> {
  const segments = WHEEL_SEGMENTS[payload.risk];
  if (!segments) throw new InvalidBetError("Invalid risk level");

  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const picked = weightedPick(
    segments.map((s, i) => ({ ...s, index: i })),
    float
  );
  const isWin = picked.multiplier > 0;

  return {
    payout: betAmount * picked.multiplier,
    multiplier: picked.multiplier,
    isWin,
    result: { segmentIndex: picked.index, multiplier: picked.multiplier },
  };
}
