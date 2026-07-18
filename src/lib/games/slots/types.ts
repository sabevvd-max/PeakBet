import { Volatility } from "../types";

export type SymbolTier = "low" | "mid" | "high" | "wild" | "scatter";

export interface SlotSymbol {
  id: string;
  icon: string;
  tier: SymbolTier;
  /** Payout as a multiplier of total bet, keyed by run length (3, 4, or 5 in a row). */
  payouts: Partial<Record<3 | 4 | 5, number>>;
  weight: number;
}

export interface ThemePack {
  slug: string;
  name: string;
  description: string;
  gradient: [string, string];
  volatility: Volatility;
  rtp: number;
  hasJackpot?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  /** 4 low, 2 mid, 1-2 high tier symbol icons, in that order. */
  lowIcons: string[];
  midIcons: string[];
  highIcons: string[];
  wildIcon: string;
  scatterIcon: string;
}

export interface SlotConfig {
  slug: string;
  name: string;
  description: string;
  gradient: [string, string];
  volatility: Volatility;
  rtp: number;
  hasJackpot: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  symbols: SlotSymbol[];
  wild: SlotSymbol;
  scatter: SlotSymbol;
  freeSpinsAwarded: number;
  freeSpinsMultiplier: number;
  minBet: number;
  maxBet: number;
}
