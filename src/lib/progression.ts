/** XP required to go from `level` to `level + 1`. Grows superlinearly so higher levels take longer. */
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.4));
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number; // 0..1
  totalXp: number;
}

/** Derives the current level + progress bar state from a user's cumulative XP total. */
export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  let remaining = Math.max(0, totalXp);

  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
    if (level > 999) break;
  }

  const xpForNextLevel = xpForLevel(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel,
    progress: xpForNextLevel === 0 ? 0 : remaining / xpForNextLevel,
    totalXp,
  };
}

export const RANK_TIERS = [
  { name: "Bronze", minLevel: 1, color: "#cd7f32" },
  { name: "Silver", minLevel: 10, color: "#c0c0c0" },
  { name: "Gold", minLevel: 20, color: "#ffd700" },
  { name: "Platinum", minLevel: 35, color: "#39ff88" },
  { name: "Diamond", minLevel: 50, color: "#3ba7ff" },
  { name: "Peak Elite", minLevel: 75, color: "#b177ff" },
] as const;

export function getRankForLevel(level: number) {
  return [...RANK_TIERS].reverse().find((tier) => level >= tier.minLevel) ?? RANK_TIERS[0];
}

/** Coins awarded for winning a round, converted to XP (used to grow level from play, not just deposits). */
export function xpFromWager(wagerAmount: number): number {
  return Math.max(1, Math.round(wagerAmount * 0.1));
}
