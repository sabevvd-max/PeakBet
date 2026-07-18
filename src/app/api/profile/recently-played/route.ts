import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ games: [] });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 12), 30);

  const rounds = await prisma.gameRound.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { game: { select: { slug: true, name: true, category: true } }, createdAt: true },
  });

  const seen = new Set<string>();
  const games = [];
  for (const round of rounds) {
    if (seen.has(round.game.slug)) continue;
    seen.add(round.game.slug);
    games.push({ slug: round.game.slug, name: round.game.name, category: round.game.category, lastPlayedAt: round.createdAt.toISOString() });
    if (games.length >= limit) break;
  }

  return NextResponse.json({ games });
}
