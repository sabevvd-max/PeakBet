import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const STARTING_BALANCE = Number(process.env.STARTING_DEMO_BALANCE ?? 10000);
const REFERRAL_BONUS = 500;

function usernameFromUser(user: User): string {
  const metaUsername = (user.user_metadata?.username as string | undefined)?.trim();
  if (metaUsername) return slugify(metaUsername).slice(0, 20) || `player${user.id.slice(0, 6)}`;
  const emailPrefix = user.email?.split("@")[0] ?? `player`;
  return slugify(emailPrefix).slice(0, 20) || `player${user.id.slice(0, 6)}`;
}

/**
 * Fetches the app-side Profile row for a Supabase-authenticated user, creating
 * it (with the starting 10,000 demo coin balance) on first login.
 */
export async function getOrCreateProfile(user: User) {
  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) {
    await prisma.profile.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const lastSession = await prisma.userSession.findFirst({ where: { userId: user.id }, orderBy: { loginAt: "desc" } });
    const staleMs = 30 * 60 * 1000;
    if (!lastSession || Date.now() - lastSession.loginAt.getTime() > staleMs) {
      await prisma.userSession.create({ data: { userId: user.id } });
    }

    return existing;
  }

  let username = usernameFromUser(user);
  let attempt = 0;

  while (true) {
    const collision = await prisma.profile.findUnique({ where: { username } });
    if (!collision) break;
    attempt += 1;
    username = `${usernameFromUser(user)}${attempt}`;
  }

  const referralCode = (user.user_metadata?.referralCode as string | undefined)?.trim();
  const referrer = referralCode ? await prisma.profile.findUnique({ where: { referralCode } }) : null;

  const profile = await prisma.$transaction(async (tx) => {
    const created = await tx.profile.create({
      data: {
        id: user.id,
        username,
        email: user.email ?? `${user.id}@peakbet.demo`,
        balance: STARTING_BALANCE,
        lastLoginAt: new Date(),
        referredById: referrer?.id,
      },
    });

    await tx.transaction.create({
      data: {
        userId: created.id,
        type: "SIGNUP_BONUS",
        amount: STARTING_BALANCE,
        balanceAfter: STARTING_BALANCE,
        description: "Welcome to PeakBet — starting demo balance",
      },
    });

    await tx.userStatistics.create({ data: { userId: created.id } });
    await tx.userSession.create({ data: { userId: created.id } });

    await tx.notification.create({
      data: {
        userId: created.id,
        type: "SYSTEM",
        title: "Welcome to PeakBet!",
        message: `You've been credited ${STARTING_BALANCE.toLocaleString()} demo coins. Good luck at the tables!`,
      },
    });

    if (referrer) {
      await tx.profile.update({ where: { id: created.id }, data: { balance: { increment: REFERRAL_BONUS } } });
      await tx.transaction.create({
        data: {
          userId: created.id,
          type: "REFERRAL_BONUS",
          amount: REFERRAL_BONUS,
          balanceAfter: STARTING_BALANCE + REFERRAL_BONUS,
          description: `Referred by ${referrer.username}`,
        },
      });

      const updatedReferrer = await tx.profile.update({
        where: { id: referrer.id },
        data: { balance: { increment: REFERRAL_BONUS } },
      });
      await tx.transaction.create({
        data: {
          userId: referrer.id,
          type: "REFERRAL_BONUS",
          amount: REFERRAL_BONUS,
          balanceAfter: updatedReferrer.balance,
          description: `Referral bonus — ${username} joined using your code`,
        },
      });
      await tx.referralBonus.create({ data: { referrerId: referrer.id, referredId: created.id, amount: REFERRAL_BONUS } });
      await tx.notification.create({
        data: {
          userId: referrer.id,
          type: "REWARD",
          title: "Referral bonus!",
          message: `${username} joined using your referral code — you earned ${REFERRAL_BONUS} demo coins.`,
        },
      });
    }

    return created;
  });

  return profile;
}
