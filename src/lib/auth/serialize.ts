import type { Profile } from "@prisma/client";
import { ProfileDTO } from "@/types/profile";

export function serializeProfile(profile: Profile): ProfileDTO {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    role: profile.role,
    balance: Number(profile.balance),
    level: profile.level,
    xp: profile.xp,
    referralCode: profile.referralCode,
    isBanned: profile.isBanned,
    createdAt: profile.createdAt.toISOString(),
  };
}
