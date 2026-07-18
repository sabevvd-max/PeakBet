import { floatsFromSeed, shuffleWithFloats } from "@/lib/game-engine/rng";

export const LEVELS = 9;
const HOUSE_EDGE = 0.01;

export type DragonDifficulty = "easy" | "medium" | "hard" | "expert";

export const DIFFICULTY_CONFIG: Record<DragonDifficulty, { tiles: number; bad: number }> = {
  easy: { tiles: 2, bad: 1 },
  medium: { tiles: 3, bad: 1 },
  hard: { tiles: 4, bad: 1 },
  expert: { tiles: 3, bad: 2 },
};

export interface DragonTowerState {
  difficulty: DragonDifficulty;
  currentLevel: number; // 0 = no level cleared yet
  badTilesByLevel: number[][]; // hidden from client
  picks: number[]; // tile index chosen at each cleared level
}

export function generateBadTiles(serverSeed: string, clientSeed: string, difficulty: DragonDifficulty): number[][] {
  const { tiles, bad } = DIFFICULTY_CONFIG[difficulty];
  const floats = floatsFromSeed(serverSeed, clientSeed, 0, LEVELS * tiles);

  const badTilesByLevel: number[][] = [];
  for (let level = 0; level < LEVELS; level++) {
    const levelFloats = floats.slice(level * tiles, (level + 1) * tiles);
    const shuffled = shuffleWithFloats(
      Array.from({ length: tiles }, (_, i) => i),
      levelFloats
    );
    badTilesByLevel.push(shuffled.slice(0, bad));
  }
  return badTilesByLevel;
}

export function dragonTowerMultiplier(levelsCleared: number, difficulty: DragonDifficulty): number {
  if (levelsCleared <= 0) return 1;
  const { tiles, bad } = DIFFICULTY_CONFIG[difficulty];
  const safe = tiles - bad;
  const perLevel = (1 - HOUSE_EDGE) * (tiles / safe);
  return Math.round(Math.pow(perLevel, levelsCleared) * 10000) / 10000;
}
