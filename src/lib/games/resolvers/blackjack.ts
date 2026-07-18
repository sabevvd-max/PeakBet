import { floatsFromSeed } from "@/lib/game-engine/rng";
import { Card, shuffledDeck, blackjackTotal, cardLabel } from "@/lib/games/cards";

export interface BlackjackState {
  deck: Card[];
  cursor: number;
  player: Card[];
  dealer: Card[];
  doubled: boolean;
  finished: boolean;
}

export function newBlackjackState(serverSeed: string, clientSeed: string): BlackjackState {
  const floats = floatsFromSeed(serverSeed, clientSeed, 0, 52);
  const deck = shuffledDeck(floats);
  const player = [deck[0], deck[2]];
  const dealer = [deck[1], deck[3]];
  return { deck, cursor: 4, player, dealer, doubled: false, finished: false };
}

export function drawCard(state: BlackjackState): Card {
  const card = state.deck[state.cursor];
  state.cursor += 1;
  return card;
}

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && blackjackTotal(hand).total === 21;
}

/** Dealer hits until 17+, and hits on soft 17. */
export function playDealer(state: BlackjackState): Card[] {
  const dealer = [...state.dealer];
  while (true) {
    const { total, soft } = blackjackTotal(dealer);
    if (total > 21) break;
    if (total > 17 || (total === 17 && !soft)) break;
    dealer.push(drawCard(state));
  }
  state.dealer = dealer;
  return dealer;
}

export type BlackjackOutcome = "player-blackjack" | "dealer-blackjack" | "push" | "player-bust" | "dealer-bust" | "player-win" | "dealer-win";

export function settleBlackjack(
  state: BlackjackState,
  betAmount: number
): { payout: number; multiplier: number; isWin: boolean; outcome: BlackjackOutcome } {
  const playerBJ = isBlackjack(state.player) && !state.doubled;
  const dealerBJ = isBlackjack(state.dealer);
  const player = blackjackTotal(state.player);
  const dealer = blackjackTotal(state.dealer);

  let outcome: BlackjackOutcome;
  let multiplier: number;

  if (playerBJ && dealerBJ) {
    outcome = "push";
    multiplier = 1;
  } else if (playerBJ) {
    outcome = "player-blackjack";
    multiplier = 2.5;
  } else if (dealerBJ) {
    outcome = "dealer-blackjack";
    multiplier = 0;
  } else if (player.total > 21) {
    outcome = "player-bust";
    multiplier = 0;
  } else if (dealer.total > 21) {
    outcome = "dealer-bust";
    multiplier = 2;
  } else if (player.total === dealer.total) {
    outcome = "push";
    multiplier = 1;
  } else if (player.total > dealer.total) {
    outcome = "player-win";
    multiplier = 2;
  } else {
    outcome = "dealer-win";
    multiplier = 0;
  }

  return {
    payout: betAmount * multiplier,
    multiplier,
    isWin: multiplier > 1,
    outcome,
  };
}

export function publicHand(hand: Card[]): string[] {
  return hand.map(cardLabel);
}
