import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { playGame } from "@/lib/game-engine/bet-service";
import { GameEngineError } from "@/lib/game-engine/errors";
import { SINGLE_SHOT_RESOLVERS } from "@/lib/games/resolvers";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const resolver = SINGLE_SHOT_RESOLVERS[slug];
  if (!resolver) return NextResponse.json({ error: "Unknown or unsupported game" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.betAmount !== "number") {
    return NextResponse.json({ error: "betAmount is required" }, { status: 400 });
  }

  try {
    const outcome = await playGame({
      userId: user.id,
      gameSlug: slug,
      betAmount: body.betAmount,
      clientSeed: typeof body.clientSeed === "string" ? body.clientSeed : undefined,
      resolve: (ctx) => resolver(body.payload ?? {}, body.betAmount, ctx),
    });

    return NextResponse.json({ outcome });
  } catch (error) {
    if (error instanceof GameEngineError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`[games/play/${slug}]`, error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
