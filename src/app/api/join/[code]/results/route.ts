import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getClassByCode } from "@/lib/classAccess";
import { ACTIVITY_GAME_PREFIX } from "@/lib/activityTypes";

const schema = z.object({
  studentId: z.string().min(1),
  activityId: z.string().min(1),
  score: z.number().int().min(0).max(1000),
  maxScore: z.number().int().min(1).max(1000),
  details: z
    .record(z.string(), z.unknown())
    .refine((d) => JSON.stringify(d).length <= 50_000, "Πολύ μεγάλα στοιχεία")
    .optional(),
});

/** Αποθήκευση αποτελέσματος μαθητή που μπήκε με κωδικό τάξης (χωρίς λογαριασμό). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cls = await getClassByCode(code);
  if (!cls) return NextResponse.json({ error: "Άγνωστος κωδικός τάξης" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Μη έγκυρα στοιχεία" }, { status: 400 });
  const { studentId, activityId, score, maxScore, details } = parsed.data;
  if (score > maxScore) return NextResponse.json({ error: "Μη έγκυρο σκορ" }, { status: 400 });

  const student = cls.subject.students.find((s) => s.id === studentId);
  const activity = cls.activities.find((a) => a.id === activityId);
  if (!student || !activity) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  await prisma.gameResult.create({
    data: {
      subjectId: cls.subject.id,
      studentId,
      gameKey: `${ACTIVITY_GAME_PREFIX}${activity.id}`,
      gameLabel: activity.title,
      score,
      maxScore,
      details: details as Prisma.InputJsonValue | undefined,
    },
  });
  return NextResponse.json({ ok: true });
}
