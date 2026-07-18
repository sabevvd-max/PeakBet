import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveSession, updateSessionState, settleSession } from "@/lib/game-engine/session-service";
import { GameEngineError } from "@/lib/game-engine/errors";
import { minesMultiplier, MinesState } from "@/lib/games/resolvers/mines";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const cellIndex = Math.round(body?.cellIndex);
  if (!body?.sessionId || !Number.isFinite(cellIndex) || cellIndex < 0 || cellIndex > 24) {
    return NextResponse.json({ error: "sessionId and cellIndex (0-24) are required" }, { status: 400 });
  }

  try {
    const session = await getActiveSession(user.id, body.sessionId);
    const state = session.state as unknown as MinesState;

    if (state.revealed.includes(cellIndex)) {
      return NextResponse.json({ error: "Cell already revealed" }, { status: 400 });
    }

    const hitMine = state.minePositions.includes(cellIndex);

    if (hitMine) {
      const result = await settleSession({
        userId: user.id,
        sessionId: session.id,
        payout: 0,
        multiplier: 0,
        isWin: false,
        resultJson: { minePositions: state.minePositions, revealed: state.revealed, hitCell: cellIndex },
      });
      return NextResponse.json({
        hitMine: true,
        minePositions: state.minePositions,
        balance: result.balance,
        settlement: result,
      });
    }

    const revealed = [...state.revealed, cellIndex];
    await updateSessionState(session.id, { ...state, revealed });
    const multiplier = minesMultiplier(revealed.length, state.minesCount);

    return NextResponse.json({
      hitMine: false,
      revealed,
      multiplier,
      potentialPayout: Math.round(Number(session.betAmount) * multiplier * 100) / 100,
    });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/mines/reveal]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
