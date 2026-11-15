import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";
import { activitySchema } from "@/lib/activitySchema";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const subjectId = req.nextUrl.searchParams.get("subjectId");
  const activities = await prisma.activity.findMany({
    where: { teacherId: session.teacherId, ...(subjectId ? { subjectId } : {}) },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, type: true, tag: true, subjectId: true, updatedAt: true },
  });
  return NextResponse.json({ activities });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

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

  const activity = await prisma.activity.create({
    data: {
      ...rest,
      data: data as Prisma.InputJsonValue,
      subjectId: subjectId ?? null,
      teacherId: session.teacherId,
    },
  });
  return NextResponse.json({ activity });
}
