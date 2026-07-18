import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveSession, settleSession } from "@/lib/game-engine/session-service";
import { GameEngineError, InvalidBetError } from "@/lib/game-engine/errors";
import { dragonTowerMultiplier, DragonTowerState } from "@/lib/games/resolvers/dragon-tower";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

  try {
    const session = await getActiveSession(user.id, body.sessionId);
    const state = session.state as unknown as DragonTowerState;

    if (state.currentLevel === 0) throw new InvalidBetError("Clear at least one level before cashing out");

    const multiplier = dragonTowerMultiplier(state.currentLevel, state.difficulty);
    const payout = Number(session.betAmount) * multiplier;

    const result = await settleSession({
      userId: user.id,
      sessionId: session.id,
      payout,
      multiplier,
      isWin: true,
      resultJson: { badTilesByLevel: state.badTilesByLevel, picks: state.picks, cashedOut: true },
    });

    return NextResponse.json({ settlement: result });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/dragon-tower/cashout]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
