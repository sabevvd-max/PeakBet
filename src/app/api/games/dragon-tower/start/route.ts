import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { startSession } from "@/lib/game-engine/session-service";
import { GameEngineError } from "@/lib/game-engine/errors";
import { generateBadTiles, DIFFICULTY_CONFIG, DragonDifficulty, DragonTowerState } from "@/lib/games/resolvers/dragon-tower";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const difficulty = body?.difficulty as DragonDifficulty;
  if (!body || typeof body.betAmount !== "number" || !DIFFICULTY_CONFIG[difficulty]) {
    return NextResponse.json({ error: "betAmount and a valid difficulty are required" }, { status: 400 });
  }

  try {
    const { session, balance } = await startSession({
      userId: user.id,
      gameSlug: "dragon-tower",
      betAmount: body.betAmount,
      initialState: { difficulty, currentLevel: 0, badTilesByLevel: [], picks: [] } satisfies DragonTowerState,
    });

    const badTilesByLevel = generateBadTiles(session.serverSeed, session.clientSeed, difficulty);
    await prisma.gameSession.update({
      where: { id: session.id },
      data: { state: { difficulty, currentLevel: 0, badTilesByLevel, picks: [] } satisfies DragonTowerState },
    });

    return NextResponse.json({
      sessionId: session.id,
      difficulty,
      tilesPerLevel: DIFFICULTY_CONFIG[difficulty].tiles,
      levels: 9,
      currentLevel: 0,
      balance,
    });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/dragon-tower/start]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
