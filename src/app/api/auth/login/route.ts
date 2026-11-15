import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Μη έγκυρο email"),
  password: z.string().min(1, "Ο κωδικός είναι υποχρεωτικός"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Μη έγκυρα στοιχεία" },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (!teacher) {
    return NextResponse.json({ error: "Λάθος email ή κωδικός" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, teacher.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Λάθος email ή κωδικός" }, { status: 401 });
  }

  const token = await createSessionToken({
    teacherId: teacher.id,
    email: teacher.email,
    name: teacher.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
