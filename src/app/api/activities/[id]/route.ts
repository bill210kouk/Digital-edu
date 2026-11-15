import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";
import { activitySchema } from "@/lib/activitySchema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const activity = await prisma.activity.findFirst({ where: { id, teacherId: session.teacherId } });
  if (!activity) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });
  return NextResponse.json({ activity });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.activity.findFirst({ where: { id, teacherId: session.teacherId } });
  if (!existing) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = activitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Μη έγκυρα στοιχεία" },
      { status: 400 }
    );
  }

  const { subjectId, data, ...rest } = parsed.data;
  if (subjectId) {
    const subject = await assertSubjectOwner(subjectId, session.teacherId);
    if (!subject) return NextResponse.json({ error: "Το μάθημα δεν βρέθηκε" }, { status: 404 });
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: { ...rest, data: data as Prisma.InputJsonValue, subjectId: subjectId ?? null },
  });
  return NextResponse.json({ activity });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.activity.findFirst({ where: { id, teacherId: session.teacherId } });
  if (!existing) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
