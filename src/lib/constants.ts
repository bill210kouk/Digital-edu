export const GRADE_LABELS: Record<string, string> = {
  A: "Α' Δημοτικού",
  B: "Β' Δημοτικού",
  C: "Γ' Δημοτικού",
  D: "Δ' Δημοτικού",
};

export const GRADE_LEVEL: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

export const SUBJECT_LABELS: Record<string, string> = {
  GLOSSA: "Γλώσσα",
  MATH: "Μαθηματικά",
  ENGLISH: "Αγγλικά",
};

export const SUBJECT_EMOJI: Record<string, string> = {
  GLOSSA: "📖",
  MATH: "🔢",
  ENGLISH: "🇬🇧",
};

export type GameDef = {
  key: string;
  title: string;
  description: string;
  emoji: string;
};

export const SUBJECT_GAMES: Record<string, GameDef[]> = {
  GLOSSA: [
    {
      key: "word-match",
      title: "Λέξη & Εικόνα",
      description: "Βρες τη λέξη που ταιριάζει με την εικόνα.",
      emoji: "🖼️",
    },
    {
      key: "fill-letter",
      title: "Συμπλήρωσε το Γράμμα",
      description: "Βρες το γράμμα που λείπει από τη λέξη.",
      emoji: "✏️",
    },
    {
      key: "syllable-memory",
      title: "Μνήμη Συλλαβών",
      description: "Βρες τα ζευγάρια καρτών με συλλαβές.",
      emoji: "🧠",
    },
  ],
  MATH: [
    {
      key: "addition",
      title: "Πρόσθεση & Αφαίρεση",
      description: "Λύσε γρήγορα τις πράξεις.",
      emoji: "➕",
    },
    {
      key: "number-match",
      title: "Αντιστοίχιση Αριθμών",
      description: "Αντιστοίχισε τον αριθμό με τις μπάλες του.",
      emoji: "🔢",
    },
    {
      key: "shape-count",
      title: "Μέτρημα Σχημάτων",
      description: "Μέτρα τα σχήματα και βρες τη σωστή απάντηση.",
      emoji: "🔺",
    },
  ],
  ENGLISH: [
    {
      key: "word-image-en",
      title: "Word & Picture",
      description: "Match the English word with the picture.",
      emoji: "🖼️",
    },
    {
      key: "translate-quiz",
      title: "Μετάφραση Quiz",
      description: "Βρες τη σωστή μετάφραση της λέξης.",
      emoji: "🔤",
    },
    {
      key: "english-memory",
      title: "English Memory",
      description: "Find the matching pairs of English words.",
      emoji: "🧠",
    },
  ],
};

export function gameTitle(subjectType: string, gameKey: string): GameDef | undefined {
  return SUBJECT_GAMES[subjectType]?.find((g) => g.key === gameKey);
}
