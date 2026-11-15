import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ActivityBuilder from "@/components/ActivityBuilder";

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  const activity = await prisma.activity.findFirst({
    where: { id, teacherId: session!.teacherId },
  });
  if (!activity) notFound();

  const subjects = await prisma.subject.findMany({
    where: { teacherId: session!.teacherId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true, grade: true },
  });

  return (
    <ActivityBuilder
      subjects={subjects}
      initialSubjectId={null}
      initial={{
        id: activity.id,
        title: activity.title,
        type: activity.type,
        tag: activity.tag,
        data: activity.data,
        subjectId: activity.subjectId,
      }}
    />
  );
}
