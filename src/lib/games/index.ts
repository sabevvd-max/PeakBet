import { TABLE_GAMES } from "./catalog";
import { SLOT_GAMES } from "./slots";
import { GameCategory, GameMeta } from "./types";

export const ALL_GAMES: GameMeta[] = [...TABLE_GAMES, ...SLOT_GAMES];

export const GAME_MAP: Record<string, GameMeta> = Object.fromEntries(ALL_GAMES.map((g) => [g.slug, g]));

export function getGameBySlug(slug: string): GameMeta | undefined {
  return GAME_MAP[slug];
}

export function getGamesByCategory(category: GameCategory | "all"): GameMeta[] {
  if (category === "all") return ALL_GAMES;
  return ALL_GAMES.filter((g) => g.category === category);
}

export function searchGames(query: string): GameMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_GAMES;
  return ALL_GAMES.filter(
    (g) => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || g.subcategory?.toLowerCase().includes(q)
  );
}

export const CATEGORY_LABELS: Record<GameCategory | "all", string> = {
  all: "All Games",
  slots: "Slots",
  table: "Table Games",
  instant: "Instant Games",
  cards: "Card Games",
  jackpot: "Jackpots",
};

export const FEATURED_GAMES = ALL_GAMES.filter((g) => g.isFeatured);
export const POPULAR_GAMES = ALL_GAMES.filter((g) => g.isPopular);
export const NEW_GAMES = ALL_GAMES.filter((g) => g.isNew);
export const JACKPOT_GAMES = ALL_GAMES.filter((g) => g.hasJackpot);

export * from "./types";
export * from "./catalog";
export * from "./slots";
