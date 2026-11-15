import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ActivitiesBoard from "@/components/ActivitiesBoard";

export default async function ActivitiesPage() {
  const session = await getSession();
  const teacherId = session!.teacherId;

  const [activities, subjects] = await Promise.all([
    prisma.activity.findMany({
      where: { teacherId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, type: true, tag: true, subjectId: true },
    }),
    prisma.subject.findMany({
      where: { teacherId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        students: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      },
    }),
  ]);

  return <ActivitiesBoard activities={activities} subjects={subjects} />;
}
