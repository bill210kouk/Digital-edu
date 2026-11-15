import { notFound } from "next/navigation";
import { getClassByCode } from "@/lib/classAccess";
import ActivityPlayer from "@/components/ActivityPlayer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClassPlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string; activityId: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { code, activityId } = await params;
  const { studentId } = await searchParams;
  const cls = await getClassByCode(code);
  if (!cls) notFound();
  const student = cls.subject.students.find((s) => s.id === studentId);
  const allowed = cls.activities.some((a) => a.id === activityId);
  if (!student || !allowed) notFound();

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) notFound();

  return (
    <main className="min-h-screen bg-sky-50 p-4">
      <ActivityPlayer
        activity={{ id: activity.id, title: activity.title, type: activity.type, tag: activity.tag, data: activity.data }}
        subjectId={cls.subject.id}
        studentId={student.id}
        studentName={student.name}
        joinCode={cls.code}
        backHref={`/class/${cls.code}?studentId=${student.id}`}
      />
    </main>
  );
}
