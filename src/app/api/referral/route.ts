import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: user.id },
    include: { referrals: { select: { username: true, createdAt: true, avatarUrl: true } } },
  });

  const bonuses = await prisma.referralBonus.findMany({ where: { referrerId: user.id } });
  const totalEarned = bonuses.reduce((sum, b) => sum + Number(b.amount), 0);

  return NextResponse.json({
    referralCode: profile.referralCode,
    referrals: profile.referrals.map((r) => ({ username: r.username, avatarUrl: r.avatarUrl, joinedAt: r.createdAt.toISOString() })),
    totalEarned,
  });
}
