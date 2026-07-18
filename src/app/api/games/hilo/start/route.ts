import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { generateServerSeed, generateClientSeed } from "@/lib/game-engine/rng";
import { signRoundToken } from "@/lib/game-engine/resume-token";
import { dealFirstCard } from "@/lib/games/resolvers/hilo";
import { cardLabel } from "@/lib/games/cards";

export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const serverSeed = generateServerSeed();
  const clientSeed = generateClientSeed();
  const { card } = dealFirstCard(serverSeed, clientSeed);

  const token = signRoundToken({ userId: user.id, serverSeed, clientSeed });

  return NextResponse.json({ firstCard: cardLabel(card), token });
}
