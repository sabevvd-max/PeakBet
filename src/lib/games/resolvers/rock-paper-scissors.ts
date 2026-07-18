import { intInRange, floatFromSeed } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { InvalidBetError } from "@/lib/game-engine/errors";

export type RPSChoice = "rock" | "paper" | "scissors";
const CHOICES: RPSChoice[] = ["rock", "paper", "scissors"];
const MULTIPLIER = 1.96;

export interface RPSPayload {
  choice: RPSChoice;
}

function beats(a: RPSChoice, b: RPSChoice): boolean {
  return (a === "rock" && b === "scissors") || (a === "paper" && b === "rock") || (a === "scissors" && b === "paper");
}

export function resolveRockPaperScissors(
  payload: RPSPayload,
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number }
): ResolveOutcome<{ playerChoice: RPSChoice; botChoice: RPSChoice; outcome: "win" | "lose" | "tie" }> {
  if (!CHOICES.includes(payload.choice)) throw new InvalidBetError("Invalid choice");

  const float = floatFromSeed(ctx.serverSeed, ctx.clientSeed, ctx.nonce);
  const botChoice = CHOICES[intInRange(float, 0, 2)];

  const outcome: "win" | "lose" | "tie" =
    botChoice === payload.choice ? "tie" : beats(payload.choice, botChoice) ? "win" : "lose";

  const payout = outcome === "win" ? betAmount * MULTIPLIER : outcome === "tie" ? betAmount : 0;

  return {
    payout,
    multiplier: outcome === "win" ? MULTIPLIER : outcome === "tie" ? 1 : 0,
    isWin: outcome === "win",
    result: { playerChoice: payload.choice, botChoice, outcome },
  };
}
