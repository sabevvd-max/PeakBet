import { floatsFromSeed } from "@/lib/game-engine/rng";
import { shuffledDeck, cardLabel, evaluateHand, compareHands } from "@/lib/games/cards";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";

function bestOfSeven(cards: import("@/lib/games/cards").Card[]) {
  let best = evaluateHand(cards.slice(0, 5));
  const combos = combinations(cards, 5);
  for (const combo of combos) {
    const evalResult = evaluateHand(combo);
    if (compareHands(evalResult, best) > 0) best = evalResult;
  }
  return best;
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

/** Heads-up, no incremental betting streets — a single showdown against the house bot for demo simplicity. */
export function resolveTexasHoldem(
  _payload: Record<string, never>,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{
  playerHole: string[];
  botHole: string[];
  community: string[];
  playerHand: string;
  botHand: string;
  winner: "player" | "bot" | "push";
}> {
  const floats = floatsFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce, 52);
  const deck = shuffledDeck(floats);
  let cursor = 0;
  const draw = () => deck[cursor++];

  const playerHole = [draw(), draw()];
  const botHole = [draw(), draw()];
  const community = [draw(), draw(), draw(), draw(), draw()];

  const playerBest = bestOfSeven([...playerHole, ...community]);
  const botBest = bestOfSeven([...botHole, ...community]);

  const cmp = compareHands(playerBest, botBest);
  const winner: "player" | "bot" | "push" = cmp > 0 ? "player" : cmp < 0 ? "bot" : "push";

  const payout = winner === "player" ? betAmount * 2 : winner === "push" ? betAmount : 0;

  return {
    payout,
    multiplier: betAmount > 0 ? payout / betAmount : 0,
    isWin: winner === "player",
    result: {
      playerHole: playerHole.map(cardLabel),
      botHole: botHole.map(cardLabel),
      community: community.map(cardLabel),
      playerHand: playerBest.label,
      botHand: botBest.label,
      winner,
    },
  };
}
