import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const STARTING_BALANCE = Number(process.env.STARTING_DEMO_BALANCE ?? 10000);

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

  const profile = await prisma.$transaction(async (tx) => {
    const created = await tx.profile.create({
      data: {
        id: user.id,
        username,
        email: user.email ?? `${user.id}@peakbet.demo`,
        balance: STARTING_BALANCE,
        lastLoginAt: new Date(),
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

    await tx.notification.create({
      data: {
        userId: created.id,
        type: "SYSTEM",
        title: "Welcome to PeakBet!",
        message: `You've been credited ${STARTING_BALANCE.toLocaleString()} demo coins. Good luck at the tables!`,
      },
    });

    return created;
  });

  return profile;
}
