import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { username: true } } },
  });

  return NextResponse.json({
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      active: a.active,
      author: a.author.username,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.body) return NextResponse.json({ error: "title and body are required" }, { status: 400 });

  const announcement = await prisma.announcement.create({
    data: { title: body.title, body: body.body, createdBy: admin.id, active: true },
  });

  await logAdminAction(admin.id, "create_announcement", announcement.id);
  return NextResponse.json({ announcement });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const announcement = await prisma.announcement.update({
    where: { id: body.id },
    data: { active: typeof body.active === "boolean" ? body.active : undefined },
  });

  await logAdminAction(admin.id, "update_announcement", announcement.id, { active: announcement.active });
  return NextResponse.json({ announcement });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await prisma.announcement.delete({ where: { id } });
  await logAdminAction(admin.id, "delete_announcement", id);
  return NextResponse.json({ ok: true });
}
