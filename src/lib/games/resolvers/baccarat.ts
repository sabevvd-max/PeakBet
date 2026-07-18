import { floatsFromSeed } from "@/lib/game-engine/rng";
import { Card, shuffledDeck, cardLabel } from "@/lib/games/cards";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export type BaccaratBet = "player" | "banker" | "tie";

export interface BaccaratPayload {
  bet: BaccaratBet;
}

function baccaratValue(card: Card): number {
  if (card.value >= 10) return 0;
  return card.value;
}

function handTotal(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + baccaratValue(c), 0) % 10;
}

export function resolveBaccarat(
  payload: BaccaratPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ player: string[]; banker: string[]; playerTotal: number; bankerTotal: number; winner: BaccaratBet }> {
  if (!["player", "banker", "tie"].includes(payload.bet)) throw new InvalidBetError("Invalid bet");

  const floats = floatsFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce, 52);
  const deck = shuffledDeck(floats);
  let cursor = 0;
  const draw = () => deck[cursor++];

  const player = [draw(), draw()];
  const banker = [draw(), draw()];

  let playerTotal = handTotal(player);
  let bankerTotal = handTotal(banker);

  const naturalWin = playerTotal >= 8 || bankerTotal >= 8;

  if (!naturalWin) {
    let playerThirdValue: number | null = null;

    if (playerTotal <= 5) {
      const card = draw();
      player.push(card);
      playerThirdValue = baccaratValue(card);
      playerTotal = handTotal(player);
    }

    const bankerDraws =
      playerThirdValue === null
        ? bankerTotal <= 5
        : bankerTotal <= 2 ||
          (bankerTotal === 3 && playerThirdValue !== 8) ||
          (bankerTotal === 4 && [2, 3, 4, 5, 6, 7].includes(playerThirdValue)) ||
          (bankerTotal === 5 && [4, 5, 6, 7].includes(playerThirdValue)) ||
          (bankerTotal === 6 && [6, 7].includes(playerThirdValue));

    if (bankerDraws) {
      banker.push(draw());
      bankerTotal = handTotal(banker);
    }
  }

  const winner: BaccaratBet = playerTotal === bankerTotal ? "tie" : playerTotal > bankerTotal ? "player" : "banker";

  let payout = 0;
  if (winner === payload.bet) {
    if (winner === "player") payout = betAmount * 2;
    else if (winner === "banker") payout = betAmount * 1.95;
    else payout = betAmount * 9;
  } else if (winner === "tie" && payload.bet !== "tie") {
    payout = betAmount; // push — player/banker bets are refunded on a tie
  }

  return {
    payout,
    multiplier: betAmount > 0 ? payout / betAmount : 0,
    isWin: winner === payload.bet,
    result: {
      player: player.map(cardLabel),
      banker: banker.map(cardLabel),
      playerTotal,
      bankerTotal,
      winner,
    },
  };
}
