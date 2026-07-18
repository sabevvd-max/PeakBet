import { floatsFromSeed } from "@/lib/game-engine/rng";
import { shuffledDeck, cardLabel } from "@/lib/games/cards";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

const MULTIPLIER = 1.92;

export function dealFirstCard(serverSeed: string, clientSeed: string) {
  const floats = floatsFromSeed(serverSeed, clientSeed, 0, 52);
  const deck = shuffledDeck(floats);
  return { card: deck[0], deck };
}

export interface HiLoPayload {
  guess: "higher" | "lower";
}

export function resolveHiLo(
  payload: HiLoPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ firstCard: string; secondCard: string; guess: string; outcome: "win" | "lose" | "push" }> {
  if (payload.guess !== "higher" && payload.guess !== "lower") throw new InvalidBetError("Invalid guess");

  const { deck } = dealFirstCard(ctx.serverSeed, ctx.clientSeed);
  const first = deck[0];
  const second = deck[1];

  let outcome: "win" | "lose" | "push";
  if (second.value === first.value) outcome = "push";
  else if (payload.guess === "higher") outcome = second.value > first.value ? "win" : "lose";
  else outcome = second.value < first.value ? "win" : "lose";

  const payout = outcome === "win" ? betAmount * MULTIPLIER : outcome === "push" ? betAmount : 0;

  return {
    payout,
    multiplier: outcome === "win" ? MULTIPLIER : outcome === "push" ? 1 : 0,
    isWin: outcome === "win",
    result: { firstCard: cardLabel(first), secondCard: cardLabel(second), guess: payload.guess, outcome },
  };
}
