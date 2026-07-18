import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveSession, doubleDownBet, settleSession } from "@/lib/game-engine/session-service";
import { GameEngineError, InvalidBetError } from "@/lib/game-engine/errors";
import { BlackjackState, drawCard, playDealer, settleBlackjack, publicHand } from "@/lib/games/resolvers/blackjack";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

  try {
    const session = await getActiveSession(user.id, body.sessionId);
    const state = session.state as unknown as BlackjackState;

    if (state.player.length !== 2 || state.doubled) {
      throw new InvalidBetError("Double down is only available as your first move");
    }

    const doubledSession = await doubleDownBet(user.id, session.id);

    state.doubled = true;
    state.player.push(drawCard(state));
    playDealer(state);

    const settled = settleBlackjack(state, Number(doubledSession.betAmount));

    const result = await settleSession({
      userId: user.id,
      sessionId: session.id,
      payout: settled.payout,
      multiplier: settled.multiplier,
      isWin: settled.isWin,
      resultJson: { player: publicHand(state.player), dealer: publicHand(state.dealer), outcome: settled.outcome, doubled: true },
    });

    return NextResponse.json({
      finished: true,
      player: publicHand(state.player),
      dealer: publicHand(state.dealer),
      outcome: settled.outcome,
      settlement: result,
    });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/blackjack/double]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
