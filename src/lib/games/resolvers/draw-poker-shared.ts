import { floatsFromSeed } from "@/lib/game-engine/rng";
import { Card, shuffledDeck, cardLabel, evaluateHand, HandEvaluation } from "@/lib/games/cards";
import { InvalidBetError } from "@/lib/game-engine/errors";

export function dealHand(serverSeed: string, clientSeed: string) {
  const floats = floatsFromSeed(serverSeed, clientSeed, 0, 52);
  const deck = shuffledDeck(floats);
  return { hand: deck.slice(0, 5), deck };
}

export function drawReplacements(deck: Card[], hand: Card[], holds: boolean[]): Card[] {
  if (holds.length !== 5) throw new InvalidBetError("holds must have exactly 5 entries");
  let drawCursor = 5;
  return hand.map((card, i) => (holds[i] ? card : deck[drawCursor++]));
}

export function evaluateFinalHand(deck: Card[], hand: Card[], holds: boolean[]) {
  const finalHand = drawReplacements(deck, hand, holds);
  const evaluation = evaluateHand(finalHand);
  return { finalHand, evaluation };
}

export function handLabels(cards: Card[]): string[] {
  return cards.map(cardLabel);
}

export function isJacksOrBetterPair(hand: Card[], evaluation: HandEvaluation): boolean {
  if (evaluation.rank !== "pair") return false;
  const pairValue = evaluation.tiebreakers[0];
  return pairValue >= 11; // Jack=11, Queen=12, King=13, Ace=14
}
