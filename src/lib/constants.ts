import { MATH_UNITS } from "@/lib/gameData";

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

export const UNIT_GAME_TYPES: { type: string; label: string; emoji: string }[] = [
  { type: "highlight", label: "Βρες το Γράμμα", emoji: "🔎" },
  { type: "picture", label: "Λέξη & Εικόνα", emoji: "🖼️" },
  { type: "missing", label: "Λείπει ένα Γράμμα", emoji: "✏️" },
  { type: "listen", label: "Άκου και Βρες", emoji: "🔊" },
];

export function parseUnitGameKey(gameKey: string) {
  const match = gameKey.match(/^unit-(.+)-(highlight|picture|missing|listen)$/);
  if (!match) return null;
  return { unitId: match[1], type: match[2] };
}

export function parseMathUnitKey(gameKey: string) {
  const match = gameKey.match(/^mathunit__(.+)__(.+)$/);
  if (!match) return null;
  return { unitId: match[1], slot: match[2] };
}

export function gameTitle(subjectType: string, gameKey: string): GameDef | undefined {
  const unitGame = parseUnitGameKey(gameKey);
  if (unitGame) {
    const gameType = UNIT_GAME_TYPES.find((g) => g.type === unitGame.type);
    if (gameType) {
      return { key: gameKey, title: gameType.label, description: "", emoji: gameType.emoji };
    }
  }

  const mathUnitGame = parseMathUnitKey(gameKey);
  if (mathUnitGame) {
    const unit = MATH_UNITS.find((u) => u.id === mathUnitGame.unitId);
    const game = unit?.games.find((g) => g.slot === mathUnitGame.slot);
    if (game) {
      return { key: gameKey, title: game.title, description: "", emoji: game.emoji };
    }
  }

  return SUBJECT_GAMES[subjectType]?.find((g) => g.key === gameKey);
}
