import { prisma } from "@/lib/prisma";

// Χωρίς χαρακτήρες που μπερδεύονται (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function normalizeJoinCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function randomCode(len = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Δίνει νέο μοναδικό κωδικό τάξης στο μάθημα. */
export async function assignJoinCode(subjectId: string): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    try {
      await prisma.subject.update({ where: { id: subjectId }, data: { joinCode: code } });
      return code;
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e; // μόνο σύγκρουση μοναδικότητας
    }
  }
  throw new Error("Δεν βρέθηκε ελεύθερος κωδικός");
}
