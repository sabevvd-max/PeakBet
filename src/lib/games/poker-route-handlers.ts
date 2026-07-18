import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { generateServerSeed, generateClientSeed } from "@/lib/game-engine/rng";
import { signRoundToken, verifyRoundToken } from "@/lib/game-engine/resume-token";
import { playGame } from "@/lib/game-engine/bet-service";
import { GameEngineError, InvalidBetError } from "@/lib/game-engine/errors";
import { dealHand, handLabels } from "@/lib/games/resolvers/draw-poker-shared";
import { shuffledDeck } from "@/lib/games/cards";
import { floatsFromSeed } from "@/lib/game-engine/rng";
import { ResolveOutcome } from "@/lib/game-engine/bet-service";
import type { Card } from "@/lib/games/cards";

export async function handleDeal() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const serverSeed = generateServerSeed();
  const clientSeed = generateClientSeed();
  const { hand } = dealHand(serverSeed, clientSeed);

  const token = signRoundToken({ userId: user.id, serverSeed, clientSeed });
  return NextResponse.json({ hand: handLabels(hand), token });
}

type DrawResolver = (
  payload: { hand: string[]; holds: boolean[] },
  betAmount: number,
  ctx: { serverSeed: string; clientSeed: string; nonce: number },
  deck: Card[],
  hand: Card[]
) => ResolveOutcome<unknown>;

export async function handleDraw(gameSlug: string, resolver: DrawResolver, request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.betAmount !== "number" || typeof body.token !== "string" || !Array.isArray(body.holds)) {
    return NextResponse.json({ error: "betAmount, token, and holds are required" }, { status: 400 });
  }

  try {
    const payload = verifyRoundToken<{ userId: string; serverSeed: string; clientSeed: string }>(body.token);
    if (payload.userId !== user.id) throw new InvalidBetError("Token does not belong to this user");

    const floats = floatsFromSeed(payload.serverSeed, payload.clientSeed, 0, 52);
    const deck = shuffledDeck(floats);
    const hand = deck.slice(0, 5);

    const outcome = await playGame({
      userId: user.id,
      gameSlug,
      betAmount: body.betAmount,
      serverSeed: payload.serverSeed,
      clientSeed: payload.clientSeed,
      resolve: (ctx) => resolver({ hand: [], holds: body.holds }, body.betAmount, ctx, deck, hand),
    });

    return NextResponse.json({ outcome });
  } catch (error) {
    if (error instanceof GameEngineError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Round expired or invalid — please deal again" }, { status: 400 });
  }
}
