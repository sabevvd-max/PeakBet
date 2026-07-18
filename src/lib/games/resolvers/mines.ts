import { floatsFromSeed, shuffleWithFloats } from "@/lib/game-engine/rng";

export const GRID_SIZE = 25;
const HOUSE_EDGE = 0.01;

export function generateMinePositions(serverSeed: string, clientSeed: string, minesCount: number): number[] {
  const cells = Array.from({ length: GRID_SIZE }, (_, i) => i);
  const floats = floatsFromSeed(serverSeed, clientSeed, 0, GRID_SIZE);
  const shuffled = shuffleWithFloats(cells, floats);
  return shuffled.slice(0, minesCount);
}

/** Fair payout multiplier after safely revealing `revealed` cells with `mines` bombs on the board. */
export function minesMultiplier(revealed: number, mines: number): number {
  if (revealed <= 0) return 1;
  let multiplier = 1;
  for (let i = 0; i < revealed; i++) {
    multiplier *= (GRID_SIZE - i) / (GRID_SIZE - mines - i);
  }
  return Math.round(multiplier * (1 - HOUSE_EDGE) * 10000) / 10000;
}

export interface MinesState {
  minesCount: number;
  minePositions: number[];
  revealed: number[];
}
