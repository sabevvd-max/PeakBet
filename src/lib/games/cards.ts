import { shuffleWithFloats } from "@/lib/game-engine/rng";

export const SUITS = ["♠", "♥", "♦", "♣"] as const;
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card {
  rank: Rank;
  suit: Suit;
  /** 2-14, Ace high. */
  value: number;
}

export function freshDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    RANKS.forEach((rank, i) => deck.push({ rank, suit, value: i + 2 }));
  }
  return deck;
}

export function shuffledDeck(floats: number[]): Card[] {
  return shuffleWithFloats(freshDeck(), floats);
}

export function cardLabel(card: Card): string {
  return `${card.rank}${card.suit}`;
}

/** Blackjack-style hand total with Aces counted as 11 unless that busts. */
export function blackjackTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = cards.reduce((sum, c) => sum + Math.min(c.value, 10), 0);
  let aces = cards.filter((c) => c.rank === "A").length;
  let soft = false;

  while (aces > 0 && total + 10 <= 21) {
    total += 10;
    soft = true;
    aces -= 1;
  }

  return { total, soft };
}

// --- 5-card poker hand evaluation -----------------------------------------

export type HandRank =
  | "high-card"
  | "pair"
  | "two-pair"
  | "three-of-a-kind"
  | "straight"
  | "flush"
  | "full-house"
  | "four-of-a-kind"
  | "straight-flush"
  | "royal-flush";

export interface HandEvaluation {
  rank: HandRank;
  rankValue: number; // 0 (high card) .. 9 (royal flush) for comparison
  tiebreakers: number[]; // descending values used to break ties within the same rank
  label: string;
}

const HAND_LABELS: Record<HandRank, string> = {
  "high-card": "High Card",
  pair: "Pair",
  "two-pair": "Two Pair",
  "three-of-a-kind": "Three of a Kind",
  straight: "Straight",
  flush: "Flush",
  "full-house": "Full House",
  "four-of-a-kind": "Four of a Kind",
  "straight-flush": "Straight Flush",
  "royal-flush": "Royal Flush",
};

const HAND_RANK_ORDER: HandRank[] = [
  "high-card",
  "pair",
  "two-pair",
  "three-of-a-kind",
  "straight",
  "flush",
  "full-house",
  "four-of-a-kind",
  "straight-flush",
  "royal-flush",
];

export function evaluateHand(cards: Card[]): HandEvaluation {
  const values = [...cards.map((c) => c.value)].sort((a, b) => b - a);
  const suitsMatch = cards.every((c) => c.suit === cards[0].suit);

  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const grouped = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  // Straight detection (handles wheel: A-2-3-4-5).
  const uniqueValues = [...new Set(values)];
  let isStraight = false;
  let straightHigh = 0;
  if (uniqueValues.length === 5) {
    if (uniqueValues[0] - uniqueValues[4] === 4) {
      isStraight = true;
      straightHigh = uniqueValues[0];
    } else if (uniqueValues.join(",") === "14,5,4,3,2") {
      isStraight = true;
      straightHigh = 5; // wheel: 5-high straight
    }
  }

  let rank: HandRank = "high-card";
  let tiebreakers = grouped.map(([v]) => v);

  if (isStraight && suitsMatch && straightHigh === 14) rank = "royal-flush";
  else if (isStraight && suitsMatch) rank = "straight-flush";
  else if (grouped[0][1] === 4) rank = "four-of-a-kind";
  else if (grouped[0][1] === 3 && grouped[1]?.[1] === 2) rank = "full-house";
  else if (suitsMatch) rank = "flush";
  else if (isStraight) rank = "straight";
  else if (grouped[0][1] === 3) rank = "three-of-a-kind";
  else if (grouped[0][1] === 2 && grouped[1]?.[1] === 2) rank = "two-pair";
  else if (grouped[0][1] === 2) rank = "pair";

  if (isStraight) tiebreakers = [straightHigh];

  return {
    rank,
    rankValue: HAND_RANK_ORDER.indexOf(rank),
    tiebreakers,
    label: HAND_LABELS[rank],
  };
}

export function compareHands(a: HandEvaluation, b: HandEvaluation): number {
  if (a.rankValue !== b.rankValue) return a.rankValue - b.rankValue;
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
    const diff = (a.tiebreakers[i] ?? 0) - (b.tiebreakers[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
