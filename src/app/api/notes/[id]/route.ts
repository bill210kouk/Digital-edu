import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertNoteOwner } from "@/lib/ownership";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });

  const { id } = await params;
  const note = await assertNoteOwner(id, session.teacherId);
  if (!note) return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });

  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
