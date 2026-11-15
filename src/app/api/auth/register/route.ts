import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Το όνομα είναι υποχρεωτικό"),
  email: z.string().email("Μη έγκυρο email"),
  password: z.string().min(6, "Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες"),
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
  const { name, email, password } = parsed.data;

  const existing = await prisma.teacher.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Υπάρχει ήδη λογαριασμός με αυτό το email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const teacher = await prisma.teacher.create({
    data: { name, email, passwordHash },
  });

  const token = await createSessionToken({
    teacherId: teacher.id,
    email: teacher.email,
    name: teacher.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
