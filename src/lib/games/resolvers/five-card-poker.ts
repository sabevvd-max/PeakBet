import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { HandRank } from "@/lib/games/cards";
import { evaluateFinalHand, handLabels } from "./draw-poker-shared";

export const FIVE_CARD_PAYTABLE: Partial<Record<HandRank, number>> = {
  "royal-flush": 300,
  "straight-flush": 60,
  "four-of-a-kind": 30,
  "full-house": 10,
  flush: 7,
  straight: 5,
  "three-of-a-kind": 3,
  "two-pair": 2,
  pair: 1,
};

export interface FiveCardPokerPayload {
  hand: string[];
  holds: boolean[];
}

export function resolveFiveCardPoker(
  payload: FiveCardPokerPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number },
  dealtDeck: import("@/lib/games/cards").Card[],
  dealtHand: import("@/lib/games/cards").Card[]
): ResolveOutcome<{ finalHand: string[]; handLabel: string; multiplier: number }> {
  const { finalHand, evaluation } = evaluateFinalHand(dealtDeck, dealtHand, payload.holds);
  const multiplier = FIVE_CARD_PAYTABLE[evaluation.rank] ?? 0;

  return {
    payout: betAmount * multiplier,
    multiplier,
    isWin: multiplier > 0,
    result: { finalHand: handLabels(finalHand), handLabel: evaluation.label, multiplier },
  };
}
