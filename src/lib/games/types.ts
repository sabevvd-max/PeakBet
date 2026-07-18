export type GameCategory = "slots" | "table" | "instant" | "cards" | "jackpot";
export type Volatility = "low" | "medium" | "high";

export interface GameMeta {
  slug: string;
  name: string;
  category: GameCategory;
  subcategory?: string;
  description: string;
  rtp: number;
  volatility: Volatility;
  minBet: number;
  maxBet: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  hasJackpot?: boolean;
  icon: string;
  gradient: [string, string];
}
