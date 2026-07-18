import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { startSession } from "@/lib/game-engine/session-service";
import { GameEngineError } from "@/lib/game-engine/errors";
import { generateMinePositions, MinesState } from "@/lib/games/resolvers/mines";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const minesCount = Math.round(body?.minesCount);
  if (!body || typeof body.betAmount !== "number" || !Number.isFinite(minesCount) || minesCount < 1 || minesCount > 24) {
    return NextResponse.json({ error: "betAmount and minesCount (1-24) are required" }, { status: 400 });
  }

  try {
    const { session, balance } = await startSession({
      userId: user.id,
      gameSlug: "mines",
      betAmount: body.betAmount,
      initialState: { minesCount, minePositions: [], revealed: [] } satisfies MinesState,
    });

    // Mine positions are derived after creation so we can use the session's own seeds, then persisted.
    const minePositions = generateMinePositions(session.serverSeed, session.clientSeed, minesCount);
    await prisma.gameSession.update({
      where: { id: session.id },
      data: { state: { minesCount, minePositions, revealed: [] } satisfies MinesState },
    });

    return NextResponse.json({ sessionId: session.id, minesCount, revealed: [], balance });
  } catch (error) {
    if (error instanceof GameEngineError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[games/mines/start]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
