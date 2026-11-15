export type Choice = { label: string; emoji?: string };
export type Round = {
  prompt: string;
  promptEmoji?: string;
  speak?: string;
  choices: Choice[];
  correctIndex: number;
};

export type WordItem = { word: string; emoji: string };
export type HighlightRound = {
  letter: string;
  items: { word: string; emoji: string; isMatch: boolean }[];
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeChoiceRounds(
  pool: { key: string; label: string; emoji?: string }[],
  count: number,
  promptFrom: "emoji" | "label"
): Round[] {
  const items = pickN(pool, Math.min(count, pool.length));
  return items.map((item) => {
    const distractors = pickN(
      pool.filter((p) => p.key !== item.key),
      3
    );
    const choices = shuffle([item, ...distractors]).map((c) => ({
      label: c.label,
      emoji: promptFrom === "label" ? c.emoji : undefined,
    }));
    const correctIndex = choices.findIndex((c) => c.label === item.label);
    return {
      prompt: promptFrom === "emoji" ? "Ποια λέξη ταιριάζει;" : `Τι σημαίνει "${item.label}";`,
      promptEmoji: promptFrom === "emoji" ? item.emoji : undefined,
      choices,
      correctIndex,
    };
  });
}

// ---------- Γλώσσα ----------

const GREEK_WORDS = [
  { key: "gata", label: "ΓΑΤΑ", emoji: "🐱" },
  { key: "skylos", label: "ΣΚΥΛΟΣ", emoji: "🐶" },
  { key: "ilios", label: "ΗΛΙΟΣ", emoji: "☀️" },
  { key: "dentro", label: "ΔΕΝΤΡΟ", emoji: "🌳" },
  { key: "milo", label: "ΜΗΛΟ", emoji: "🍎" },
  { key: "psari", label: "ΨΑΡΙ", emoji: "🐟" },
  { key: "loulou", label: "ΛΟΥΛΟΥΔΙ", emoji: "🌸" },
  { key: "auto", label: "ΑΥΤΟΚΙΝΗΤΟ", emoji: "🚗" },
  { key: "spiti", label: "ΣΠΙΤΙ", emoji: "🏠" },
  { key: "vivlio", label: "ΒΙΒΛΙΟ", emoji: "📖" },
  { key: "mpala", label: "ΜΠΑΛΑ", emoji: "⚽" },
  { key: "feggari", label: "ΦΕΓΓΑΡΙ", emoji: "🌙" },
  { key: "pouli", label: "ΠΟΥΛΙ", emoji: "🐦" },
  { key: "asteri", label: "ΑΣΤΕΡΙ", emoji: "⭐" },
];

function wordsForGrade(level: number) {
  const maxLen = level === 1 ? 5 : level === 2 ? 6 : level === 3 ? 8 : 20;
  const list = GREEK_WORDS.filter((w) => w.label.length <= maxLen);
  return list.length >= 6 ? list : GREEK_WORDS;
}

export function wordMatchRounds(level: number): Round[] {
  return makeChoiceRounds(wordsForGrade(level), 8, "emoji");
}

export function fillLetterRounds(level: number): Round[] {
  const pool = wordsForGrade(level);
  const items = pickN(pool, 8);
  const letters = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ".split("");
  return items.map((item) => {
    const idx = randInt(1, item.label.length - 2 < 1 ? item.label.length - 1 : item.label.length - 2);
    const correctLetter = item.label[idx];
    const masked = item.label.slice(0, idx) + "_" + item.label.slice(idx + 1);
    const distractors = pickN(letters.filter((l) => l !== correctLetter), 3);
    const choices = shuffle([correctLetter, ...distractors]).map((l) => ({ label: l }));
    const correctIndex = choices.findIndex((c) => c.label === correctLetter);
    return {
      prompt: `Ποιο γράμμα λείπει; ${masked}`,
      promptEmoji: item.emoji,
      choices,
      correctIndex,
    };
  });
}

export function syllableMemoryPairs(level: number): string[] {
  const syllables = [
    "ΓΑ", "ΤΑ", "ΛΟ", "ΣΠΙ", "ΗΛΙ", "ΟΣ", "ΜΗ", "ΛΟΥ", "ΔΙ", "ΒΙ", "ΒΛΙΟ", "ΨΑ", "ΡΙ", "ΦΕΓ", "ΓΑ2", "ΚΑ",
  ];
  const n = level === 1 ? 4 : level === 2 ? 5 : level === 3 ? 6 : 8;
  return pickN(syllables, n).map((s) => s.replace("2", ""));
}

// ---------- Μαθηματικά ----------

export function additionRounds(level: number): Round[] {
  const range = level === 1 ? 10 : level === 2 ? 20 : level === 3 ? 50 : 100;
  const allowSubtraction = level >= 2;
  const allowMultiplication = level >= 4;
  const rounds: Round[] = [];
  for (let i = 0; i < 8; i++) {
    let a = randInt(1, range);
    let b = randInt(1, range);
    let op: "+" | "-" | "×" = "+";
    const roll = Math.random();
    if (allowMultiplication && roll < 0.25) {
      op = "×";
      a = randInt(1, 10);
      b = randInt(1, 10);
    } else if (allowSubtraction && roll < 0.65) {
      op = "-";
      if (b > a) [a, b] = [b, a];
    }
    const correct = op === "+" ? a + b : op === "-" ? a - b : a * b;
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const delta = randInt(-5, 5) || 1;
      const candidate = correct + delta;
      if (candidate >= 0 && candidate !== correct) distractors.add(candidate);
    }
    const choices = shuffle([correct, ...distractors]).map((n) => ({ label: String(n) }));
    const correctIndex = choices.findIndex((c) => c.label === String(correct));
    rounds.push({
      prompt: `${a} ${op} ${b} = ;`,
      choices,
      correctIndex,
    });
  }
  return rounds;
}

export function numberMatchRounds(level: number): Round[] {
  const range = level === 1 ? 10 : level === 2 ? 20 : level === 3 ? 50 : 100;
  const rounds: Round[] = [];
  for (let i = 0; i < 8; i++) {
    const n = randInt(1, range);
    const tens = Math.floor(n / 10);
    const units = n % 10;
    const visual = `${"📦".repeat(tens)}${tens > 0 ? " " : ""}${"🔵".repeat(units) || "—"}`;
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const candidate = n + (randInt(1, 6) * (Math.random() < 0.5 ? -1 : 1));
      if (candidate > 0 && candidate !== n) distractors.add(candidate);
    }
    const choices = shuffle([n, ...distractors]).map((x) => ({ label: String(x) }));
    const correctIndex = choices.findIndex((c) => c.label === String(n));
    rounds.push({
      prompt: "Ποιος αριθμός ταιριάζει; " + visual,
      choices,
      correctIndex,
    });
  }
  return rounds;
}

const SHAPES = ["🔺", "🔵", "🟩", "⭐"];

export function shapeCountRounds(level: number): Round[] {
  const maxCount = level === 1 ? 6 : level === 2 ? 10 : level === 3 ? 15 : 20;
  const rounds: Round[] = [];
  for (let i = 0; i < 6; i++) {
    const target = SHAPES[randInt(0, SHAPES.length - 1)];
    const other = SHAPES.filter((s) => s !== target)[randInt(0, SHAPES.length - 2)];
    const targetCount = randInt(2, maxCount);
    const otherCount = randInt(1, maxCount);
    const cells = shuffle([
      ...Array(targetCount).fill(target),
      ...Array(otherCount).fill(other),
    ]);
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const candidate = targetCount + randInt(-3, 3);
      if (candidate >= 0 && candidate !== targetCount) distractors.add(candidate);
    }
    const choices = shuffle([targetCount, ...distractors]).map((n) => ({ label: String(n) }));
    const correctIndex = choices.findIndex((c) => c.label === String(targetCount));
    rounds.push({
      prompt: `Πόσα ${target} βλέπεις;`,
      promptEmoji: cells.join(" "),
      choices,
      correctIndex,
    });
  }
  return rounds;
}

// ---------- Αγγλικά ----------

const ENGLISH_WORDS = [
  { key: "cat", label: "CAT", gr: "ΓΑΤΑ", emoji: "🐱" },
  { key: "dog", label: "DOG", gr: "ΣΚΥΛΟΣ", emoji: "🐶" },
  { key: "sun", label: "SUN", gr: "ΗΛΙΟΣ", emoji: "☀️" },
  { key: "tree", label: "TREE", gr: "ΔΕΝΤΡΟ", emoji: "🌳" },
  { key: "apple", label: "APPLE", gr: "ΜΗΛΟ", emoji: "🍎" },
  { key: "fish", label: "FISH", gr: "ΨΑΡΙ", emoji: "🐟" },
  { key: "flower", label: "FLOWER", gr: "ΛΟΥΛΟΥΔΙ", emoji: "🌸" },
  { key: "car", label: "CAR", gr: "ΑΥΤΟΚΙΝΗΤΟ", emoji: "🚗" },
  { key: "house", label: "HOUSE", gr: "ΣΠΙΤΙ", emoji: "🏠" },
  { key: "book", label: "BOOK", gr: "ΒΙΒΛΙΟ", emoji: "📖" },
  { key: "ball", label: "BALL", gr: "ΜΠΑΛΑ", emoji: "⚽" },
  { key: "moon", label: "MOON", gr: "ΦΕΓΓΑΡΙ", emoji: "🌙" },
  { key: "bird", label: "BIRD", gr: "ΠΟΥΛΙ", emoji: "🐦" },
  { key: "star", label: "STAR", gr: "ΑΣΤΕΡΙ", emoji: "⭐" },
];

function englishForGrade(level: number) {
  const maxLen = level === 1 ? 4 : level === 2 ? 5 : level === 3 ? 6 : 20;
  const list = ENGLISH_WORDS.filter((w) => w.label.length <= maxLen);
  return list.length >= 6 ? list : ENGLISH_WORDS;
}

export function wordImageEnRounds(level: number): Round[] {
  return makeChoiceRounds(englishForGrade(level), 8, "emoji");
}

export function translateQuizRounds(level: number): Round[] {
  const pool = englishForGrade(level);
  const items = pickN(pool, 8);
  return items.map((item) => {
    const distractors = pickN(
      pool.filter((p) => p.key !== item.key),
      3
    );
    const choices = shuffle([item, ...distractors]).map((c) => ({ label: c.gr }));
    const correctIndex = choices.findIndex((c) => c.label === item.gr);
    return {
      prompt: `What is "${item.label}" in Greek?`,
      choices,
      correctIndex,
    };
  });
}

export function englishMemoryPairs(level: number): string[] {
  const words = englishForGrade(level).map((w) => w.label);
  const n = level === 1 ? 4 : level === 2 ? 5 : level === 3 ? 6 : 8;
  return pickN(words, n);
}

// ---------- Ενότητες Λεξιλογίου (Γλώσσα) ----------

export type VocabUnit = { id: string; title: string; emoji: string; words: WordItem[] };

const VOCAB_UNITS: VocabUnit[] = [
  {
    id: "animals",
    title: "Ζώα",
    emoji: "🐾",
    words: [
      { word: "ΓΑΤΑ", emoji: "🐱" },
      { word: "ΣΚΥΛΟΣ", emoji: "🐶" },
      { word: "ΨΑΡΙ", emoji: "🐟" },
      { word: "ΠΟΥΛΙ", emoji: "🐦" },
      { word: "ΑΛΟΓΟ", emoji: "🐴" },
      { word: "ΑΓΕΛΑΔΑ", emoji: "🐄" },
      { word: "ΠΡΟΒΑΤΟ", emoji: "🐑" },
      { word: "ΖΕΒΡΑ", emoji: "🦓" },
    ],
  },
  {
    id: "home",
    title: "Σπίτι & Οικογένεια",
    emoji: "🏠",
    words: [
      { word: "ΣΠΙΤΙ", emoji: "🏠" },
      { word: "ΜΑΜΑ", emoji: "👩" },
      { word: "ΜΠΑΜΠΑΣ", emoji: "👨" },
      { word: "ΓΙΑΓΙΑ", emoji: "👵" },
      { word: "ΠΑΠΠΟΥΣ", emoji: "👴" },
      { word: "ΚΟΥΖΙΝΑ", emoji: "🍽️" },
      { word: "ΚΡΕΒΑΤΙ", emoji: "🛏️" },
      { word: "ΠΟΡΤΑ", emoji: "🚪" },
    ],
  },
  {
    id: "nature",
    title: "Φύση",
    emoji: "🌳",
    words: [
      { word: "ΗΛΙΟΣ", emoji: "☀️" },
      { word: "ΦΕΓΓΑΡΙ", emoji: "🌙" },
      { word: "ΔΕΝΤΡΟ", emoji: "🌳" },
      { word: "ΛΟΥΛΟΥΔΙ", emoji: "🌸" },
      { word: "ΒΟΥΝΟ", emoji: "⛰️" },
      { word: "ΘΑΛΑΣΣΑ", emoji: "🌊" },
      { word: "ΒΡΟΧΗ", emoji: "🌧️" },
      { word: "ΑΣΤΕΡΙ", emoji: "⭐" },
    ],
  },
  {
    id: "food",
    title: "Φαγητό",
    emoji: "🍎",
    words: [
      { word: "ΜΗΛΟ", emoji: "🍎" },
      { word: "ΨΩΜΙ", emoji: "🍞" },
      { word: "ΓΑΛΑ", emoji: "🥛" },
      { word: "ΤΥΡΙ", emoji: "🧀" },
      { word: "ΣΟΚΟΛΑΤΑ", emoji: "🍫" },
      { word: "ΜΠΑΝΑΝΑ", emoji: "🍌" },
      { word: "ΖΥΜΑΡΙΚΑ", emoji: "🍝" },
      { word: "ΠΟΡΤΟΚΑΛΙ", emoji: "🍊" },
    ],
  },
  {
    id: "school",
    title: "Σχολείο",
    emoji: "🏫",
    words: [
      { word: "ΒΙΒΛΙΟ", emoji: "📖" },
      { word: "ΜΟΛΥΒΙ", emoji: "✏️" },
      { word: "ΤΕΤΡΑΔΙΟ", emoji: "📓" },
      { word: "ΣΧΟΛΕΙΟ", emoji: "🏫" },
      { word: "ΘΡΑΝΙΟ", emoji: "🪑" },
      { word: "ΚΑΝΟΝΑΣ", emoji: "📏" },
      { word: "ΣΑΚΙΔΙΟ", emoji: "🎒" },
      { word: "ΜΠΑΛΑ", emoji: "⚽" },
    ],
  },
];

export function vocabUnitsForGrade(level: number): VocabUnit[] {
  const maxLen = level === 1 ? 6 : level === 2 ? 7 : level === 3 ? 9 : 20;
  return VOCAB_UNITS.map((u) => {
    const filtered = u.words.filter((w) => w.word.length <= maxLen);
    return { ...u, words: filtered.length >= 4 ? filtered : u.words };
  });
}

export function getVocabUnit(unitId: string, level: number): VocabUnit | undefined {
  return vocabUnitsForGrade(level).find((u) => u.id === unitId);
}

const GREEK_LETTERS = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ".split("");

export function unitPictureRounds(unit: VocabUnit): Round[] {
  const pool = unit.words.map((w) => ({ key: w.word, label: w.word, emoji: w.emoji }));
  return makeChoiceRounds(pool, Math.min(8, pool.length), "emoji");
}

export function unitMissingLetterRounds(unit: VocabUnit): Round[] {
  const items = pickN(unit.words, Math.min(8, unit.words.length));
  const unitLetters = Array.from(new Set(unit.words.map((w) => w.word).join("").split(""))).filter(
    (l) => GREEK_LETTERS.includes(l)
  );
  return items.map((item) => {
    const idx = randInt(1, item.word.length - 2 < 1 ? item.word.length - 1 : item.word.length - 2);
    const correctLetter = item.word[idx];
    const masked = item.word.slice(0, idx) + "_" + item.word.slice(idx + 1);
    const distractorPool = (unitLetters.length >= 4 ? unitLetters : GREEK_LETTERS).filter(
      (l) => l !== correctLetter
    );
    const distractors = pickN(distractorPool, 3);
    const choices = shuffle([correctLetter, ...distractors]).map((l) => ({ label: l }));
    const correctIndex = choices.findIndex((c) => c.label === correctLetter);
    return {
      prompt: `Ποιο γράμμα λείπει; ${masked}`,
      promptEmoji: item.emoji,
      choices,
      correctIndex,
    };
  });
}

export function unitListenRounds(unit: VocabUnit): Round[] {
  const items = pickN(unit.words, Math.min(6, unit.words.length));
  return items.map((item) => {
    const distractors = pickN(
      unit.words.filter((w) => w.word !== item.word),
      3
    );
    const choices = shuffle([item, ...distractors]).map((c) => ({ label: c.word }));
    const correctIndex = choices.findIndex((c) => c.label === item.word);
    return {
      prompt: "🔊 Άκου και βρες τη σωστή λέξη",
      speak: item.word,
      choices,
      correctIndex,
    };
  });
}

export function unitHighlightRounds(unit: VocabUnit): HighlightRound[] {
  const rounds: HighlightRound[] = [];
  const allLetters = unit.words.map((w) => w.word).join("").split("");
  const candidateLetters = Array.from(new Set(allLetters)).filter((l) => GREEK_LETTERS.includes(l));

  for (let i = 0; i < 5; i++) {
    const letter = candidateLetters[randInt(0, candidateLetters.length - 1)];
    const matching = unit.words.filter((w) => w.word.includes(letter));
    const nonMatching = unit.words.filter((w) => !w.word.includes(letter));
    if (matching.length < 2 || nonMatching.length < 1) continue;
    const chosenMatch = pickN(matching, Math.min(matching.length, 4));
    const chosenOther = pickN(nonMatching, Math.min(nonMatching.length, 3));
    const items = shuffle([
      ...chosenMatch.map((w) => ({ ...w, isMatch: true })),
      ...chosenOther.map((w) => ({ ...w, isMatch: false })),
    ]);
    rounds.push({ letter, items });
  }
  return rounds.length > 0 ? rounds : [];
}
