import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const games = await prisma.game.findMany({ orderBy: { playCount: "desc" } });

  const stats = await Promise.all(
    games.map(async (game) => {
      const agg = await prisma.gameRound.aggregate({
        where: { gameId: game.id },
        _sum: { betAmount: true, payout: true },
        _count: true,
      });

      const wagered = Number(agg._sum.betAmount ?? 0);
      const payout = Number(agg._sum.payout ?? 0);

      return {
        slug: game.slug,
        name: game.name,
        category: game.category,
        configuredRtp: Number(game.rtp),
        playCount: game.playCount,
        rounds: agg._count,
        wagered,
        payout,
        actualRtp: wagered > 0 ? Math.round((payout / wagered) * 10000) / 100 : null,
      };
    })
  );

  return NextResponse.json({ stats });
}
