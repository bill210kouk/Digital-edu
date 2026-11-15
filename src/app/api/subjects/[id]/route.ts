import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const subject = await assertSubjectOwner(id, session.teacherId);
  if (!subject) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  const full = await prisma.subject.findUnique({
    where: { id },
    include: {
      students: { orderBy: { name: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  return NextResponse.json({ subject: full });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const subject = await assertSubjectOwner(id, session.teacherId);
  if (!subject) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  await prisma.subject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
