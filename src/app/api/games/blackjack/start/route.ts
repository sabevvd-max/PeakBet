import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { startSession, settleSession } from "@/lib/game-engine/session-service";
import { GameEngineError } from "@/lib/game-engine/errors";
import { newBlackjackState, isBlackjack, settleBlackjack, publicHand } from "@/lib/games/resolvers/blackjack";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.betAmount !== "number") {
    return NextResponse.json({ error: "betAmount is required" }, { status: 400 });
  }

  try {
    const { session, balance } = await startSession({
      userId: user.id,
      gameSlug: "blackjack",
      betAmount: body.betAmount,
      initialState: {},
    });

    const state = newBlackjackState(session.serverSeed, session.clientSeed);
    await prisma.gameSession.update({ where: { id: session.id }, data: { state: JSON.parse(JSON.stringify(state)) } });

    const playerBJ = isBlackjack(state.player);
    const dealerBJ = isBlackjack(state.dealer);

    if (playerBJ || dealerBJ) {
      const settled = settleBlackjack(state, body.betAmount);
      const result = await settleSession({
        userId: user.id,
        sessionId: session.id,
        payout: settled.payout,
        multiplier: settled.multiplier,
        isWin: settled.isWin,
        resultJson: { player: publicHand(state.player), dealer: publicHand(state.dealer), outcome: settled.outcome },
      });
      return NextResponse.json({
        sessionId: session.id,
        finished: true,
        player: publicHand(state.player),
        dealer: publicHand(state.dealer),
        outcome: settled.outcome,
        settlement: result,
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      finished: false,
      player: publicHand(state.player),
      dealerUpCard: publicHand(state.dealer)[0],
      balance,
    });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/blackjack/start]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
