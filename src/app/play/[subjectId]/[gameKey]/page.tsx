import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { GRADE_LEVEL, gameTitle } from "@/lib/constants";
import GameRunner from "@/components/GameRunner";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ subjectId: string; gameKey: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const session = await getSession();
  const { subjectId, gameKey } = await params;
  const { studentId } = await searchParams;

  const subject = await assertSubjectOwner(subjectId, session!.teacherId);
  if (!subject || !studentId) notFound();

  const student = await prisma.student.findFirst({
    where: { id: studentId, subjectId },
  });
  if (!student) notFound();

  const game = gameTitle(subject.type, gameKey);
  if (!game) notFound();

  return (
    <GameRunner
      subjectId={subjectId}
      studentId={student.id}
      studentName={student.name}
      gameKey={gameKey}
      gameTitle={game.title}
      gameEmoji={game.emoji}
      gradeLevel={GRADE_LEVEL[subject.grade]}
      backHref={`/dashboard/subjects/${subjectId}`}
    />
  );
}
