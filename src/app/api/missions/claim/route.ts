import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { dailyKey, weeklyKey, monthlyKey } from "@/lib/game-engine/period";

const PERIOD_KEY: Record<string, string> = { DAILY: dailyKey(), WEEKLY: weeklyKey(), MONTHLY: monthlyKey() };

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.missionId) return NextResponse.json({ error: "missionId is required" }, { status: 400 });

  const mission = await prisma.mission.findUnique({ where: { id: body.missionId } });
  if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 });

  const periodKey = PERIOD_KEY[mission.period];
  const userMission = await prisma.userMission.findUnique({
    where: { userId_missionId_periodKey: { userId: user.id, missionId: mission.id, periodKey } },
  });

  if (!userMission?.completed) return NextResponse.json({ error: "Mission not completed yet" }, { status: 400 });
  if (userMission.claimedAt) return NextResponse.json({ error: "Reward already claimed" }, { status: 400 });

  const coinReward = Number(mission.coinReward);

  const result = await prisma.$transaction(async (tx) => {
    await tx.userMission.update({ where: { id: userMission.id }, data: { claimedAt: new Date() } });

    const profile = await tx.profile.update({
      where: { id: user.id },
      data: { balance: { increment: coinReward }, xp: { increment: mission.xpReward } },
    });

    await tx.transaction.create({
      data: {
        userId: user.id,
        type: "MISSION_REWARD",
        amount: coinReward,
        balanceAfter: profile.balance,
        description: `Mission reward: ${mission.title}`,
      },
    });

    return profile;
  });

  return NextResponse.json({ balance: Number(result.balance) });
}
