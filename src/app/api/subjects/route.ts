import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1, "Το όνομα μαθήματος είναι υποχρεωτικό"),
  type: z.enum(["GLOSSA", "MATH", "ENGLISH"]),
  grade: z.enum(["A", "B", "C", "D"]),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const subjects = await prisma.subject.findMany({
    where: { teacherId: session.teacherId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { students: true } } },
  });
  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Μη έγκυρα στοιχεία" },
      { status: 400 }
    );
  }

  const subject = await prisma.subject.create({
    data: { ...parsed.data, teacherId: session.teacherId },
  });
  return NextResponse.json({ subject });
}
