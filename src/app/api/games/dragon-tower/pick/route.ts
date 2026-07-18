import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveSession, updateSessionState, settleSession } from "@/lib/game-engine/session-service";
import { GameEngineError } from "@/lib/game-engine/errors";
import { LEVELS, dragonTowerMultiplier, DragonTowerState } from "@/lib/games/resolvers/dragon-tower";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const tileIndex = Math.round(body?.tileIndex);
  if (!body?.sessionId || !Number.isFinite(tileIndex)) {
    return NextResponse.json({ error: "sessionId and tileIndex are required" }, { status: 400 });
  }

  try {
    const session = await getActiveSession(user.id, body.sessionId);
    const state = session.state as unknown as DragonTowerState;

    if (state.currentLevel >= LEVELS) {
      return NextResponse.json({ error: "Tower already complete — cash out" }, { status: 400 });
    }

    const badTiles = state.badTilesByLevel[state.currentLevel];
    const hitBad = badTiles.includes(tileIndex);

    if (hitBad) {
      const result = await settleSession({
        userId: user.id,
        sessionId: session.id,
        payout: 0,
        multiplier: 0,
        isWin: false,
        resultJson: { badTilesByLevel: state.badTilesByLevel, picks: [...state.picks, tileIndex], failedAtLevel: state.currentLevel },
      });
      return NextResponse.json({ hitBad: true, badTiles, balance: result.balance, settlement: result });
    }

    const newLevel = state.currentLevel + 1;
    const picks = [...state.picks, tileIndex];
    await updateSessionState(session.id, { ...state, currentLevel: newLevel, picks });
    const multiplier = dragonTowerMultiplier(newLevel, state.difficulty);

    if (newLevel >= LEVELS) {
      const potentialPayout = Number(session.betAmount) * multiplier;
      const result = await settleSession({
        userId: user.id,
        sessionId: session.id,
        payout: potentialPayout,
        multiplier,
        isWin: true,
        resultJson: { badTilesByLevel: state.badTilesByLevel, picks, completedTower: true },
      });
      return NextResponse.json({ hitBad: false, towerComplete: true, multiplier, settlement: result });
    }

    return NextResponse.json({
      hitBad: false,
      currentLevel: newLevel,
      multiplier,
      potentialPayout: Math.round(Number(session.betAmount) * multiplier * 100) / 100,
    });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/dragon-tower/pick]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
