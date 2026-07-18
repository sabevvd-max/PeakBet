import { floatsFromSeed, weightedPick } from "../../game-engine/rng";
import { PAYLINES, REELS, ROWS } from "./paylines";
import { SlotConfig, SlotSymbol } from "./types";

export interface SpinGrid {
  cells: string[][]; // [reel][row] = symbol id
  winningLines: { line: number; symbolId: string; length: number; payout: number }[];
  scatterCount: number;
  scatterPayout: number;
  spinPayout: number; // total payout for this single grid (multiplier of bet already applied)
}

export interface SpinResult {
  mainGrid: SpinGrid;
  freeSpinGrids: SpinGrid[];
  freeSpinsAwarded: number;
  totalPayout: number;
  payoutMultiplier: number;
  winTier: "none" | "win" | "big" | "mega" | "ultra";
}

function allSymbols(config: SlotConfig): SlotSymbol[] {
  return [...config.symbols, config.wild, config.scatter];
}

function generateGrid(config: SlotConfig, floats: number[]): string[][] {
  const pool = allSymbols(config);
  const cells: string[][] = Array.from({ length: REELS }, () => Array(ROWS).fill(""));
  let cursor = 0;

  for (let reel = 0; reel < REELS; reel++) {
    for (let row = 0; row < ROWS; row++) {
      cells[reel][row] = weightedPick(pool, floats[cursor]).id;
      cursor += 1;
    }
  }
  return cells;
}

function symbolById(config: SlotConfig, id: string): SlotSymbol {
  return allSymbols(config).find((s) => s.id === id)!;
}

function evaluateGrid(config: SlotConfig, cells: string[][], betAmount: number, multiplier: number): SpinGrid {
  const winningLines: SpinGrid["winningLines"] = [];
  let spinPayout = 0;

  for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
    const line = PAYLINES[lineIndex];
    const lineSymbols = line.map((row, reel) => cells[reel][row]);

    // Determine the symbol this line is matching (first non-wild, non-scatter symbol).
    let matchId = lineSymbols[0];
    if (matchId === config.wild.id) {
      const firstConcrete = lineSymbols.find((id) => id !== config.wild.id && id !== config.scatter.id);
      matchId = firstConcrete ?? config.wild.id;
    }
    if (matchId === config.scatter.id) continue; // scatters don't pay on paylines

    let runLength = 0;
    for (const id of lineSymbols) {
      if (id === matchId || id === config.wild.id) {
        runLength += 1;
      } else {
        break;
      }
    }

    if (runLength >= 3) {
      const symbol = symbolById(config, matchId);
      const payoutMult = symbol.payouts[runLength as 3 | 4 | 5];
      if (payoutMult) {
        const payout = payoutMult * betAmount * multiplier;
        spinPayout += payout;
        winningLines.push({ line: lineIndex, symbolId: matchId, length: runLength, payout });
      }
    }
  }

  const scatterCount = cells.flat().filter((id) => id === config.scatter.id).length;
  let scatterPayout = 0;
  if (scatterCount >= 3) {
    const count = Math.min(scatterCount, 5) as 3 | 4 | 5;
    scatterPayout = (config.scatter.payouts[count] ?? 0) * betAmount * multiplier;
    spinPayout += scatterPayout;
  }

  return { cells, winningLines, scatterCount, scatterPayout, spinPayout };
}

/**
 * Resolves one full spin (including any triggered free spins) deterministically
 * from a server seed / client seed / nonce triple. Pure function — no I/O.
 */
export function spinSlot(
  config: SlotConfig,
  betAmount: number,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): SpinResult {
  const mainFloats = floatsFromSeed(serverSeed, clientSeed, nonce, REELS * ROWS);
  const mainCells = generateGrid(config, mainFloats);
  const mainGrid = evaluateGrid(config, mainCells, betAmount, 1);

  const freeSpinGrids: SpinGrid[] = [];
  let freeSpinsAwarded = mainGrid.scatterCount >= 3 ? config.freeSpinsAwarded : 0;
  let freeSpinCursor = 0;

  while (freeSpinCursor < freeSpinsAwarded) {
    const floats = floatsFromSeed(serverSeed, clientSeed, nonce + 1000 * (freeSpinCursor + 1), REELS * ROWS);
    const cells = generateGrid(config, floats);
    const grid = evaluateGrid(config, cells, betAmount, config.freeSpinsMultiplier);
    freeSpinGrids.push(grid);

    // Scatters during free spins can retrigger additional free spins (common industry mechanic).
    if (grid.scatterCount >= 3) {
      freeSpinsAwarded += Math.round(config.freeSpinsAwarded / 2);
    }
    freeSpinCursor += 1;
  }

  const totalPayout =
    mainGrid.spinPayout + freeSpinGrids.reduce((sum, grid) => sum + grid.spinPayout, 0);
  const payoutMultiplier = betAmount > 0 ? totalPayout / betAmount : 0;

  let winTier: SpinResult["winTier"] = "none";
  if (payoutMultiplier >= 50) winTier = "ultra";
  else if (payoutMultiplier >= 25) winTier = "mega";
  else if (payoutMultiplier >= 10) winTier = "big";
  else if (payoutMultiplier > 0) winTier = "win";

  return {
    mainGrid,
    freeSpinGrids,
    freeSpinsAwarded,
    totalPayout: Math.round(totalPayout * 100) / 100,
    payoutMultiplier: Math.round(payoutMultiplier * 100) / 100,
    winTier,
  };
}
