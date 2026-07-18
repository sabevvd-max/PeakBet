import { floatsFromSeed } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export type PlinkoRisk = "low" | "medium" | "high";

export interface PlinkoPayload {
  rows: number; // 8..16
  risk: PlinkoRisk;
}

const RISK_CURVE: Record<PlinkoRisk, { center: number; growth: number }> = {
  low: { center: 0.5, growth: 1.25 },
  medium: { center: 0.3, growth: 1.65 },
  high: { center: 0.15, growth: 2.3 },
};

export function plinkoMultipliers(rows: number, risk: PlinkoRisk): number[] {
  const { center, growth } = RISK_CURVE[risk];
  const mid = rows / 2;
  return Array.from({ length: rows + 1 }, (_, i) => {
    const dist = Math.abs(i - mid);
    const mult = center * Math.pow(growth, dist);
    return Math.round(Math.min(mult, 1000) * 100) / 100;
  });
}

export function resolvePlinko(
  payload: PlinkoPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ path: number[]; bucket: number; multiplier: number }> {
  const rows = Math.round(payload.rows);
  if (rows < 8 || rows > 16) throw new InvalidBetError("Rows must be between 8 and 16");
  if (!["low", "medium", "high"].includes(payload.risk)) throw new InvalidBetError("Invalid risk level");

  const floats = floatsFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce, rows);
  const path = floats.map((f) => (f < 0.5 ? 0 : 1));
  const bucket = path.reduce((sum: number, dir) => sum + dir, 0);

  const multipliers = plinkoMultipliers(rows, payload.risk);
  const multiplier = multipliers[bucket];
  const isWin = multiplier > 1;

  return {
    payout: betAmount * multiplier,
    multiplier,
    isWin,
    result: { path, bucket, multiplier },
  };
}
