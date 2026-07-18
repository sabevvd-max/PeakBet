import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { serializeProfile } from "@/lib/auth/serialize";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const profile = await getOrCreateProfile(user);
  return NextResponse.json({ profile: serializeProfile(profile) });
}

const updateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-z0-9_-]+$/i).optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.username) {
    const collision = await prisma.profile.findFirst({
      where: { username: parsed.data.username, NOT: { id: user.id } },
    });
    if (collision) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
  }

  const profile = await prisma.profile.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.username && { username: parsed.data.username }),
      ...(parsed.data.bio !== undefined && { bio: parsed.data.bio }),
      ...(parsed.data.avatarUrl !== undefined && { avatarUrl: parsed.data.avatarUrl || null }),
    },
  });

  return NextResponse.json({ profile: serializeProfile(profile) });
}
