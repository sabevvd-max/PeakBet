/** Shared "how high does the multiplier climb" curve used by Crash and Limbo. ~1% house edge, long-tail distribution. */
export function generateCrashPoint(float: number): number {
  const houseEdge = 0.01;
  const safeFloat = Math.min(Math.max(float, 1e-9), 1 - 1e-9);
  const raw = (1 - houseEdge) / (1 - safeFloat);
  return Math.max(1, Math.min(1000000, Math.floor(raw * 100) / 100));
}
