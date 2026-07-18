import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { verifyRoundToken } from "@/lib/game-engine/resume-token";
import { playGame } from "@/lib/game-engine/bet-service";
import { GameEngineError, InvalidBetError } from "@/lib/game-engine/errors";
import { resolveHiLo } from "@/lib/games/resolvers/hilo";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.betAmount !== "number" || typeof body.token !== "string") {
    return NextResponse.json({ error: "betAmount and token are required" }, { status: 400 });
  }

  try {
    const payload = verifyRoundToken<{ userId: string; serverSeed: string; clientSeed: string }>(body.token);
    if (payload.userId !== user.id) throw new InvalidBetError("Token does not belong to this user");

    const outcome = await playGame({
      userId: user.id,
      gameSlug: "hilo",
      betAmount: body.betAmount,
      serverSeed: payload.serverSeed,
      clientSeed: payload.clientSeed,
      resolve: (ctx) => resolveHiLo({ guess: body.guess }, body.betAmount, ctx),
    });

    return NextResponse.json({ outcome });
  } catch (error) {
    if (error instanceof GameEngineError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Round expired or invalid — please deal again" }, { status: 400 });
  }
}
