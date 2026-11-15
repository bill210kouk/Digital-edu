import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ActivityPlayer from "@/components/ActivityPlayer";

export default async function PlayActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const session = await getSession();
  const teacherId = session!.teacherId;
  const { id } = await params;
  const { studentId } = await searchParams;

  const activity = await prisma.activity.findFirst({ where: { id, teacherId } });
  if (!activity) notFound();

  let student: { id: string; name: string; subjectId: string } | null = null;
  if (studentId) {
    student = await prisma.student.findFirst({
      where: { id: studentId, subject: { teacherId } },
      select: { id: true, name: true, subjectId: true },
    });
    if (!student) notFound();
  }

  return (
    <ActivityPlayer
      activity={{
        id: activity.id,
        title: activity.title,
        type: activity.type,
        tag: activity.tag,
        data: activity.data,
      }}
      subjectId={student?.subjectId ?? null}
      studentId={student?.id ?? null}
      studentName={student?.name ?? null}
      backHref={student ? `/dashboard/subjects/${student.subjectId}` : "/dashboard/activities"}
    />
  );
}
