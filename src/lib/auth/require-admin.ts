import { prisma } from "@/lib/prisma";
import { requireUser } from "./require-user";

/** Resolves the current user's Profile only if they're an ADMIN, else null. */
export async function requireAdmin() {
  const user = await requireUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "ADMIN") return null;

  return profile;
}

export async function logAdminAction(adminId: string, action: string, target?: string, meta?: object) {
  await prisma.adminLog.create({ data: { adminId, action, target, meta } });
}
