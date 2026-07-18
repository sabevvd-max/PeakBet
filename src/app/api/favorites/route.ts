import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favoriteGame.findMany({
    where: { userId: user.id },
    include: { game: { select: { slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ favorites: favorites.map((f) => f.game.slug) });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const game = await prisma.game.findUnique({ where: { slug: body.slug } });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  await prisma.favoriteGame.upsert({
    where: { userId_gameId: { userId: user.id, gameId: game.id } },
    create: { userId: user.id, gameId: game.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  await prisma.favoriteGame.deleteMany({ where: { userId: user.id, gameId: game.id } });
  return NextResponse.json({ ok: true });
}
