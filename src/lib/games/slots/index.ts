import { GameMeta } from "../types";
import { buildSlotConfig } from "./build";
import { THEME_PACKS } from "./themes";
import { SlotConfig } from "./types";

export const SLOT_CONFIGS: SlotConfig[] = THEME_PACKS.map(buildSlotConfig);

export const SLOT_CONFIG_MAP: Record<string, SlotConfig> = Object.fromEntries(
  SLOT_CONFIGS.map((config) => [config.slug, config])
);

export function getSlotConfig(slug: string): SlotConfig | undefined {
  return SLOT_CONFIG_MAP[slug];
}

export const SLOT_GAMES: GameMeta[] = SLOT_CONFIGS.map((config) => ({
  slug: config.slug,
  name: config.name,
  category: "slots",
  description: config.description,
  rtp: config.rtp,
  volatility: config.volatility,
  minBet: config.minBet,
  maxBet: config.maxBet,
  isFeatured: config.isFeatured,
  isNew: config.isNew,
  isPopular: config.isPopular,
  hasJackpot: config.hasJackpot,
  icon: config.symbols.find((s) => s.tier === "high")?.icon ?? "🎰",
  gradient: config.gradient,
}));

export * from "./types";
export * from "./resolver";
export * from "./paylines";
