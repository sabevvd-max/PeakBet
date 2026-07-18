import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import { resolveDice } from "./dice";
import { resolveCoinFlip } from "./coinflip";
import { resolveLimbo } from "./limbo";
import { resolveCrash } from "./crash";
import { resolvePlinko } from "./plinko";
import { resolveKeno } from "./keno";
import { resolveWheel } from "./wheel";
import { resolveRockPaperScissors } from "./rock-paper-scissors";
import { resolveNumberGuess } from "./number-guess";
import { resolveRoulette, RoulettePayload } from "./roulette";
import { resolveBaccarat } from "./baccarat";
import { resolveTexasHoldem } from "./texas-holdem";

type Ctx = { serverSeed: string; clientSeed: string; nonce: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = (payload: any, betAmount: number, ctx: Ctx) => ResolveOutcome<any>;

/** Every single-request game (no mid-round state) dispatches through here by slug. */
export const SINGLE_SHOT_RESOLVERS: Record<string, AnyResolver> = {
  dice: resolveDice,
  coinflip: resolveCoinFlip,
  limbo: resolveLimbo,
  crash: resolveCrash,
  plinko: resolvePlinko,
  keno: resolveKeno,
  wheel: resolveWheel,
  "rock-paper-scissors": resolveRockPaperScissors,
  "number-guess": resolveNumberGuess,
  "european-roulette": (payload: RoulettePayload, bet: number, ctx: Ctx) =>
    resolveRoulette({ ...payload, american: false }, bet, ctx),
  "american-roulette": (payload: RoulettePayload, bet: number, ctx: Ctx) =>
    resolveRoulette({ ...payload, american: true }, bet, ctx),
  baccarat: resolveBaccarat,
  "texas-holdem": resolveTexasHoldem,
};
