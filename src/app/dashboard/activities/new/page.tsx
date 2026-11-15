import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ActivityBuilder from "@/components/ActivityBuilder";

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const session = await getSession();
  const { subjectId } = await searchParams;
  const subjects = await prisma.subject.findMany({
    where: { teacherId: session!.teacherId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true, grade: true },
  });
  const valid = subjects.some((s) => s.id === subjectId) ? (subjectId ?? null) : null;

  return <ActivityBuilder subjects={subjects} initial={null} initialSubjectId={valid} />;
}
