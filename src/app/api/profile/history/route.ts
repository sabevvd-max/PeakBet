import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 30), 100);
  const cursor = searchParams.get("cursor");

  const rounds = await prisma.gameRound.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: { game: { select: { name: true, slug: true, category: true } } },
  });

  return NextResponse.json({
    rounds: rounds.map((r) => ({
      id: r.id,
      game: r.game.name,
      gameSlug: r.game.slug,
      category: r.game.category,
      betAmount: Number(r.betAmount),
      payout: Number(r.payout),
      multiplier: Number(r.multiplier),
      isWin: r.isWin,
      createdAt: r.createdAt.toISOString(),
    })),
    nextCursor: rounds.length === limit ? rounds[rounds.length - 1].id : null,
  });
}
