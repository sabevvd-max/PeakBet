import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveSession, settleSession } from "@/lib/game-engine/session-service";
import { GameEngineError, InvalidBetError } from "@/lib/game-engine/errors";
import { minesMultiplier, MinesState } from "@/lib/games/resolvers/mines";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

  try {
    const session = await getActiveSession(user.id, body.sessionId);
    const state = session.state as unknown as MinesState;

    if (state.revealed.length === 0) throw new InvalidBetError("Reveal at least one cell before cashing out");

    const multiplier = minesMultiplier(state.revealed.length, state.minesCount);
    const payout = Number(session.betAmount) * multiplier;

    const result = await settleSession({
      userId: user.id,
      sessionId: session.id,
      payout,
      multiplier,
      isWin: true,
      resultJson: { minePositions: state.minePositions, revealed: state.revealed, cashedOut: true },
    });

    return NextResponse.json({ settlement: result });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/mines/cashout]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
