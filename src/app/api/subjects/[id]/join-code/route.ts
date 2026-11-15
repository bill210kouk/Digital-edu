import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { assertSubjectOwner } from "@/lib/ownership";
import { assignJoinCode } from "@/lib/joinCode";

/** Δημιουργεί (ή ανανεώνει) τον κωδικό τάξης του μαθήματος. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 });
  const { id } = await params;
  const owned = await assertSubjectOwner(id, session.teacherId);
  if (!owned) return NextResponse.json({ error: "Το μάθημα δεν βρέθηκε" }, { status: 404 });
  const joinCode = await assignJoinCode(id);
  return NextResponse.json({ joinCode });
}
