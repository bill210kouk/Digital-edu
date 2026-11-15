export const ACTIVITY_TYPE_KEYS = [
  "mc",
  "fill",
  "open",
  "crossword",
  "wheel",
  "memory",
  "math",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPE_KEYS)[number];

export const ACTIVITY_TYPES: Record<ActivityType, { label: string; emoji: string }> = {
  mc: { label: "Πολλαπλής επιλογής", emoji: "✅" },
  fill: { label: "Συμπλήρωση κενού", emoji: "✏️" },
  open: { label: "Ανοιχτού τύπου", emoji: "💬" },
  crossword: { label: "Σταυρόλεξο", emoji: "🔤" },
  wheel: { label: "Τροχός", emoji: "🎡" },
  memory: { label: "Παιχνίδι μνήμης", emoji: "🧠" },
  math: { label: "Πράξεις", emoji: "➗" },
};

export function activityTypeInfo(type: string) {
  return ACTIVITY_TYPES[type as ActivityType] ?? { label: type, emoji: "🎮" };
}

export const ACTIVITY_GAME_PREFIX = "activity__";
