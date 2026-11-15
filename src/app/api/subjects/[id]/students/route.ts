import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";

const schema = z.object({ name: z.string().min(1, "Το όνομα μαθητή είναι υποχρεωτικό") });

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

  const student = await prisma.student.create({
    data: { name: parsed.data.name, subjectId: id },
  });
  return NextResponse.json({ student });
}
