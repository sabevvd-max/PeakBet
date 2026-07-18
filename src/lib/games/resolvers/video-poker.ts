import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { HandRank } from "@/lib/games/cards";
import { evaluateFinalHand, handLabels, isJacksOrBetterPair } from "./draw-poker-shared";

export const VIDEO_POKER_PAYTABLE: Partial<Record<HandRank, number>> = {
  "royal-flush": 250,
  "straight-flush": 50,
  "four-of-a-kind": 25,
  "full-house": 9,
  flush: 6,
  straight: 4,
  "three-of-a-kind": 3,
  "two-pair": 2,
};

export interface VideoPokerPayload {
  hand: string[]; // original dealt cards, echoed back for display only
  holds: boolean[];
}

export function resolveVideoPoker(
  payload: VideoPokerPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number },
  dealtDeck: import("@/lib/games/cards").Card[],
  dealtHand: import("@/lib/games/cards").Card[]
): ResolveOutcome<{ finalHand: string[]; handLabel: string; multiplier: number }> {
  const { finalHand, evaluation } = evaluateFinalHand(dealtDeck, dealtHand, payload.holds);

  let multiplier = VIDEO_POKER_PAYTABLE[evaluation.rank] ?? 0;
  if (evaluation.rank === "pair" && isJacksOrBetterPair(finalHand, evaluation)) multiplier = 1;

  return {
    payout: betAmount * multiplier,
    multiplier,
    isWin: multiplier > 0,
    result: { finalHand: handLabels(finalHand), handLabel: evaluation.label, multiplier },
  };
}
