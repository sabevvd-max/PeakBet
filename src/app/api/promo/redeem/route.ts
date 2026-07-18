import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const code = (body?.code as string | undefined)?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Promo code is required" }, { status: 400 });

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) return NextResponse.json({ error: "Invalid or inactive promo code" }, { status: 404 });
  if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
  if (promo.redeemedCount >= promo.maxRedemptions) return NextResponse.json({ error: "This promo code has reached its redemption limit" }, { status: 400 });

  const already = await prisma.promoRedemption.findUnique({
    where: { userId_promoCodeId: { userId: user.id, promoCodeId: promo.id } },
  });
  if (already) return NextResponse.json({ error: "You've already redeemed this code" }, { status: 400 });

  const coinReward = Number(promo.coinReward);

  const result = await prisma.$transaction(async (tx) => {
    await tx.promoRedemption.create({ data: { userId: user.id, promoCodeId: promo.id } });
    await tx.promoCode.update({ where: { id: promo.id }, data: { redeemedCount: { increment: 1 } } });

    const profile = await tx.profile.update({ where: { id: user.id }, data: { balance: { increment: coinReward } } });

    await tx.transaction.create({
      data: {
        userId: user.id,
        type: "PROMO_CODE",
        amount: coinReward,
        balanceAfter: profile.balance,
        description: `Promo code redeemed: ${code}`,
      },
    });

    return profile;
  });

  return NextResponse.json({ balance: Number(result.balance), amount: coinReward });
}
