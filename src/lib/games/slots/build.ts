import { ThemePack, SlotConfig, SlotSymbol } from "./types";

const VOLATILITY_TUNING = {
  low: { lowWeight: 20, midWeight: 10, highWeight: 5, wildWeight: 2.5, scatterWeight: 3, payoutScale: 0.75 },
  medium: { lowWeight: 18, midWeight: 8, highWeight: 3.5, wildWeight: 1.6, scatterWeight: 2.4, payoutScale: 1 },
  high: { lowWeight: 15, midWeight: 6, highWeight: 2.2, wildWeight: 1, scatterWeight: 1.8, payoutScale: 1.6 },
} as const;

/** Turns a lightweight theme pack (just icons + flavor) into a full, balanced slot config. */
export function buildSlotConfig(theme: ThemePack): SlotConfig {
  const rtp = theme.rtp;
  const tuning = VOLATILITY_TUNING[theme.volatility];
  const scale = tuning.payoutScale;

  const lowBase = [0.2, 0.25, 0.3, 0.35];
  const lowSymbols: SlotSymbol[] = theme.lowIcons.map((icon, i) => ({
    id: `low-${i}`,
    icon,
    tier: "low",
    weight: tuning.lowWeight,
    payouts: {
      3: round2(lowBase[i % lowBase.length] * scale),
      4: round2(lowBase[i % lowBase.length] * 1.8 * scale),
      5: round2(lowBase[i % lowBase.length] * 4 * scale),
    },
  }));

  const midBase = [0.6, 0.9];
  const midSymbols: SlotSymbol[] = theme.midIcons.map((icon, i) => ({
    id: `mid-${i}`,
    icon,
    tier: "mid",
    weight: tuning.midWeight,
    payouts: {
      3: round2(midBase[i % midBase.length] * scale),
      4: round2(midBase[i % midBase.length] * 3 * scale),
      5: round2(midBase[i % midBase.length] * 8 * scale),
    },
  }));

  const highBase = [2, 3.5];
  const highSymbols: SlotSymbol[] = theme.highIcons.map((icon, i) => ({
    id: `high-${i}`,
    icon,
    tier: "high",
    weight: tuning.highWeight,
    payouts: {
      3: round2(highBase[i % highBase.length] * scale),
      4: round2(highBase[i % highBase.length] * 4 * scale),
      5: round2(highBase[i % highBase.length] * 12 * scale),
    },
  }));

  const wild: SlotSymbol = {
    id: "wild",
    icon: theme.wildIcon,
    tier: "wild",
    weight: tuning.wildWeight,
    payouts: {
      3: round2(4 * scale),
      4: round2(10 * scale),
      5: round2(30 * scale),
    },
  };

  const scatter: SlotSymbol = {
    id: "scatter",
    icon: theme.scatterIcon,
    tier: "scatter",
    weight: tuning.scatterWeight,
    payouts: {
      3: round2(2 * scale),
      4: round2(6 * scale),
      5: round2(25 * scale),
    },
  };

  return {
    slug: theme.slug,
    name: theme.name,
    description: theme.description,
    gradient: theme.gradient,
    volatility: theme.volatility,
    rtp,
    hasJackpot: !!theme.hasJackpot,
    isNew: !!theme.isNew,
    isFeatured: !!theme.isFeatured,
    isPopular: !!theme.isPopular,
    symbols: [...lowSymbols, ...midSymbols, ...highSymbols],
    wild,
    scatter,
    freeSpinsAwarded: 10,
    freeSpinsMultiplier: theme.volatility === "high" ? 3 : theme.volatility === "medium" ? 2 : 1.5,
    minBet: 1,
    maxBet: theme.hasJackpot ? 2000 : 3000,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
