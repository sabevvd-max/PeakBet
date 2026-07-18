import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const announcement = await prisma.announcement.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  if (!announcement) return NextResponse.json({ announcement: null });

  return NextResponse.json({
    announcement: { id: announcement.id, title: announcement.title, body: announcement.body, createdAt: announcement.createdAt.toISOString() },
  });
}
