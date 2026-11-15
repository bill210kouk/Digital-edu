import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubjectsBoard from "@/components/SubjectsBoard";

export default async function DashboardPage() {
  const session = await getSession();
  const subjects = await prisma.subject.findMany({
    where: { teacherId: session!.teacherId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { students: true } } },
  });

  return <SubjectsBoard initialSubjects={subjects} />;
}
