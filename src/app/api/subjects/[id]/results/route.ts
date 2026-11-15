import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";

const schema = z.object({
  studentId: z.string().min(1),
  gameKey: z.string().min(1),
  score: z.number().int().min(0),
  maxScore: z.number().int().min(1),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const subject = await assertSubjectOwner(id, session.teacherId);
  if (!subject) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  const results = await prisma.gameResult.findMany({
    where: { subjectId: id },
    orderBy: { createdAt: "desc" },
    include: { student: true },
    take: 100,
  });
  return NextResponse.json({ results });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const subject = await assertSubjectOwner(id, session.teacherId);
  if (!subject) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Μη έγκυρα στοιχεία" },
      { status: 400 }
    );
  }

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, subjectId: id },
  });
  if (!student) return NextResponse.json({ error: "Ο μαθητής δεν βρέθηκε" }, { status: 404 });

  const result = await prisma.gameResult.create({
    data: { ...parsed.data, subjectId: id },
  });
  return NextResponse.json({ result });
}
