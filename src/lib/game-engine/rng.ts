import { createHash, createHmac, randomBytes } from "crypto";

/**
 * Provably-fair RNG in the style used across the industry: a server seed
 * (hashed up front so it can't be changed after the bet, then revealed
 * after) combined with a client seed and an incrementing nonce, run through
 * HMAC-SHA256 to derive a stream of floats in [0, 1).
 *
 * This is a demo platform with no real money at stake, but implementing
 * fairness properly is part of teaching how these systems work.
 */

export function generateServerSeed(): string {
  return randomBytes(32).toString("hex");
}

export function hashServerSeed(serverSeed: string): string {
  return createHash("sha256").update(serverSeed).digest("hex");
}

export function generateClientSeed(): string {
  return randomBytes(8).toString("hex");
}

/** Derives an arbitrary number of independent floats in [0, 1) from one seed triple. */
export function floatsFromSeed(serverSeed: string, clientSeed: string, nonce: number, count: number): number[] {
  const floats: number[] = [];
  let cursor = 0;

  while (floats.length < count) {
    const hmac = createHmac("sha256", serverSeed).update(`${clientSeed}:${nonce}:${cursor}`).digest("hex");

    // Consume the 64 hex chars in 8-char (32-bit) chunks for extra entropy per hash.
    for (let i = 0; i < hmac.length && floats.length < count; i += 8) {
      const chunk = hmac.slice(i, i + 8);
      const int = parseInt(chunk, 16);
      floats.push(int / 0xffffffff);
    }
    cursor += 1;
  }

  return floats;
}

export function floatFromSeed(serverSeed: string, clientSeed: string, nonce: number): number {
  return floatsFromSeed(serverSeed, clientSeed, nonce, 1)[0];
}

/** Integer in [min, max] inclusive, derived from the seed stream. */
export function intInRange(float: number, min: number, max: number): number {
  return Math.floor(float * (max - min + 1)) + min;
}

/** Weighted pick from a list of `{ weight }` items using one float. */
export function weightedPick<T extends { weight: number }>(items: T[], float: number): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let target = float * totalWeight;

  for (const item of items) {
    if (target < item.weight) return item;
    target -= item.weight;
  }
  return items[items.length - 1];
}

/** Fisher–Yates shuffle driven by a deterministic float stream (for card decks, reels, etc.). */
export function shuffleWithFloats<T>(array: T[], floats: number[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(floats[result.length - 1 - i] * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
