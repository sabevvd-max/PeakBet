import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    codes: codes.map((c) => ({
      id: c.id,
      code: c.code,
      coinReward: Number(c.coinReward),
      maxRedemptions: c.maxRedemptions,
      redeemedCount: c.redeemedCount,
      active: c.active,
      expiresAt: c.expiresAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.code || typeof body.coinReward !== "number") {
    return NextResponse.json({ error: "code and coinReward are required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: body.code.toUpperCase(),
      coinReward: body.coinReward,
      maxRedemptions: body.maxRedemptions ?? 1000,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  await logAdminAction(admin.id, "create_promo_code", promo.code);
  return NextResponse.json({ promo });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const promo = await prisma.promoCode.update({
    where: { id: body.id },
    data: { active: typeof body.active === "boolean" ? body.active : undefined },
  });

  await logAdminAction(admin.id, "update_promo_code", promo.code, { active: promo.active });
  return NextResponse.json({ promo });
}
