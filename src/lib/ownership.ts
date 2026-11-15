import { prisma } from "@/lib/prisma";

export async function assertSubjectOwner(subjectId: string, teacherId: string) {
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, teacherId },
  });
  return subject;
}

export async function assertStudentOwner(studentId: string, teacherId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, subject: { teacherId } },
    include: { subject: true },
  });
  return student;
}

export async function assertNoteOwner(noteId: string, teacherId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, subject: { teacherId } },
  });
  return note;
}
