import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import SubjectDetail from "@/components/SubjectDetail";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  const owned = await assertSubjectOwner(id, session!.teacherId);
  if (!owned) notFound();

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      students: { orderBy: { name: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!subject) notFound();

  const results = await prisma.gameResult.findMany({
    where: { subjectId: id },
    orderBy: { createdAt: "desc" },
    include: { student: true },
    take: 50,
  });

  return <SubjectDetail subject={subject} results={results} />;
}
