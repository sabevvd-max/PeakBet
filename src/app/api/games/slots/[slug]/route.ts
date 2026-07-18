import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { playGame } from "@/lib/game-engine/bet-service";
import { GameEngineError } from "@/lib/game-engine/errors";
import { getSlotConfig, spinSlot } from "@/lib/games/slots";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const config = getSlotConfig(slug);
  if (!config) return NextResponse.json({ error: "Unknown slot" }, { status: 404 });

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
      resolve: (ctx) => {
        const spin = spinSlot(config, body.betAmount, ctx.serverSeed, ctx.clientSeed, ctx.nonce);
        return {
          payout: spin.totalPayout,
          multiplier: spin.payoutMultiplier,
          isWin: spin.totalPayout > 0,
          result: spin,
        };
      },
    });

    return NextResponse.json({ outcome });
  } catch (error) {
    if (error instanceof GameEngineError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`[games/slots/${slug}]`, error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
