import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 30);

  const rounds = await prisma.gameRound.findMany({
    where: { isWin: true, multiplier: { gte: 25 }, game: { hasJackpot: true } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      profile: { select: { username: true, avatarUrl: true, level: true } },
      game: { select: { name: true, slug: true } },
    },
  });

  const winners = rounds.map((r) => ({
    id: r.id,
    username: r.profile.username,
    avatarUrl: r.profile.avatarUrl,
    level: r.profile.level,
    game: r.game.name,
    gameSlug: r.game.slug,
    payout: Number(r.payout),
    multiplier: Number(r.multiplier),
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ winners });
}
