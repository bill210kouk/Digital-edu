import { prisma } from "@/lib/prisma";
import { normalizeJoinCode } from "@/lib/joinCode";

/** Μάθημα από κωδικό τάξης, μαζί με μαθητές και δραστηριότητες του εκπαιδευτικού. */
export async function getClassByCode(rawCode: string) {
  const code = normalizeJoinCode(rawCode);
  if (code.length < 4) return null;
  const subject = await prisma.subject.findUnique({
    where: { joinCode: code },
    select: {
      id: true,
      name: true,
      teacherId: true,
      students: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });
  if (!subject) return null;
  const activities = await prisma.activity.findMany({
    where: { teacherId: subject.teacherId, OR: [{ subjectId: subject.id }, { subjectId: null }] },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, type: true, tag: true },
  });
  return { subject, activities, code };
}
