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

export type VocabUnit = {
  id: string;
  title: string;
  emoji: string;
  words: WordItem[];
  advancedWords?: WordItem[];
};

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
    advancedWords: [
      { word: "ΧΕΛΩΝΑ", emoji: "🐢" },
      { word: "ΔΕΛΦΙΝΙ", emoji: "🐬" },
      { word: "ΠΕΤΑΛΟΥΔΑ", emoji: "🦋" },
      { word: "ΑΡΚΟΥΔΑ", emoji: "🐻" },
      { word: "ΕΛΕΦΑΝΤΑΣ", emoji: "🐘" },
      { word: "ΚΡΟΚΟΔΕΙΛΟΣ", emoji: "🐊" },
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
    advancedWords: [
      { word: "ΟΙΚΟΓΕΝΕΙΑ", emoji: "👪" },
      { word: "ΥΠΝΟΔΩΜΑΤΙΟ", emoji: "🛌" },
      { word: "ΣΑΛΟΝΙ", emoji: "🛋️" },
      { word: "ΜΠΑΝΙΟ", emoji: "🛁" },
      { word: "ΑΔΕΡΦΙΑ", emoji: "🧑‍🤝‍🧑" },
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
    advancedWords: [
      { word: "ΟΥΡΑΝΟΤΟΞΟ", emoji: "🌈" },
      { word: "ΚΕΡΑΥΝΟΣ", emoji: "⚡" },
      { word: "ΔΑΣΟΣ", emoji: "🌲" },
      { word: "ΗΦΑΙΣΤΕΙΟ", emoji: "🌋" },
      { word: "ΠΑΓΕΤΩΝΑΣ", emoji: "🧊" },
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
    advancedWords: [
      { word: "ΚΑΡΠΟΥΖΙ", emoji: "🍉" },
      { word: "ΦΡΑΟΥΛΑ", emoji: "🍓" },
      { word: "ΣΤΑΦΥΛΙ", emoji: "🍇" },
      { word: "ΛΑΧΑΝΙΚΑ", emoji: "🥦" },
      { word: "ΚΑΡΟΤΟ", emoji: "🥕" },
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
    advancedWords: [
      { word: "ΥΠΟΛΟΓΙΣΤΗΣ", emoji: "💻" },
      { word: "ΧΑΡΤΗΣ", emoji: "🗺️" },
      { word: "ΕΡΓΑΣΙΑ", emoji: "📝" },
      { word: "ΔΑΣΚΑΛΟΣ", emoji: "👨‍🏫" },
      { word: "ΒΙΒΛΙΟΘΗΚΗ", emoji: "📚" },
    ],
  },
  {
    id: "clothes",
    title: "Ρούχα",
    emoji: "👕",
    words: [
      { word: "ΠΟΥΚΑΜΙΣΟ", emoji: "👕" },
      { word: "ΦΟΡΕΜΑ", emoji: "👗" },
      { word: "ΚΑΠΕΛΟ", emoji: "🎩" },
      { word: "ΚΑΛΤΣΕΣ", emoji: "🧦" },
      { word: "ΠΑΠΟΥΤΣΙΑ", emoji: "👟" },
    ],
    advancedWords: [
      { word: "ΠΑΝΤΕΛΟΝΙ", emoji: "👖" },
      { word: "ΖΑΚΕΤΑ", emoji: "🧥" },
      { word: "ΓΑΝΤΙΑ", emoji: "🧤" },
      { word: "ΦΟΥΛΑΡΙ", emoji: "🧣" },
    ],
  },
  {
    id: "weather",
    title: "Καιρός",
    emoji: "⛅",
    words: [
      { word: "ΗΛΙΟΣ", emoji: "☀️" },
      { word: "ΣΥΝΝΕΦΟ", emoji: "☁️" },
      { word: "ΒΡΟΧΗ", emoji: "🌧️" },
      { word: "ΧΙΟΝΙ", emoji: "❄️" },
      { word: "ΑΝΕΜΟΣ", emoji: "🌬️" },
    ],
    advancedWords: [
      { word: "ΚΑΤΑΙΓΙΔΑ", emoji: "⛈️" },
      { word: "ΟΜΙΧΛΗ", emoji: "🌫️" },
      { word: "ΘΕΡΜΟΚΡΑΣΙΑ", emoji: "🌡️" },
    ],
  },
];

export function vocabUnitsForGrade(level: number): VocabUnit[] {
  const maxLen = level === 1 ? 6 : level === 2 ? 8 : level === 3 ? 11 : 20;
  const minLenForTopGrade = level === 4 ? 6 : 0;
  return VOCAB_UNITS.map((u) => {
    const pool = level >= 3 ? [...u.words, ...(u.advancedWords ?? [])] : u.words;
    const filtered = pool.filter((w) => w.word.length <= maxLen && w.word.length >= minLenForTopGrade);
    return { ...u, words: filtered.length >= 4 ? filtered : pool };
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

// ---------- Ενότητες Μαθηματικών (ανά τάξη) ----------

export function timesTableRounds(tables: number[], count = 8): Round[] {
  const rounds: Round[] = [];
  for (let i = 0; i < count; i++) {
    const a = tables[randInt(0, tables.length - 1)];
    const b = randInt(1, 10);
    const correct = a * b;
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const candidate = correct + randInt(-10, 10) * (randInt(0, 1) === 0 ? a : 1);
      if (candidate > 0 && candidate !== correct) distractors.add(candidate);
    }
    const choices = shuffle([correct, ...distractors]).map((n) => ({ label: String(n) }));
    const correctIndex = choices.findIndex((c) => c.label === String(correct));
    rounds.push({ prompt: `${a} × ${b} = ;`, choices, correctIndex });
  }
  return rounds;
}

export function divisionRounds(count = 8): Round[] {
  const rounds: Round[] = [];
  for (let i = 0; i < count; i++) {
    const divisor = randInt(2, 10);
    const quotient = randInt(2, 12);
    const dividend = divisor * quotient;
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const candidate = quotient + randInt(-4, 4);
      if (candidate > 0 && candidate !== quotient) distractors.add(candidate);
    }
    const choices = shuffle([quotient, ...distractors]).map((n) => ({ label: String(n) }));
    const correctIndex = choices.findIndex((c) => c.label === String(quotient));
    rounds.push({ prompt: `${dividend} ÷ ${divisor} = ;`, choices, correctIndex });
  }
  return rounds;
}

export function decimalAdditionRounds(count = 8): Round[] {
  const rounds: Round[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.round((Math.random() * 8 + 0.5) * 10) / 10;
    const b = Math.round((Math.random() * 8 + 0.5) * 10) / 10;
    const correct = Math.round((a + b) * 10) / 10;
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const delta = Math.round((Math.random() * 2 - 1) * 10) / 10 || 0.3;
      const candidate = Math.round((correct + delta) * 10) / 10;
      if (candidate > 0 && candidate !== correct) distractors.add(candidate);
    }
    const choices = shuffle([correct, ...distractors]).map((n) => ({ label: n.toFixed(1) }));
    const correctIndex = choices.findIndex((c) => c.label === correct.toFixed(1));
    rounds.push({ prompt: `${a.toFixed(1)} + ${b.toFixed(1)} = ;`, choices, correctIndex });
  }
  return rounds;
}

export function fractionVisualRounds(denominators: number[], count = 6): Round[] {
  const rounds: Round[] = [];
  for (let i = 0; i < count; i++) {
    const d = denominators[randInt(0, denominators.length - 1)];
    const n = randInt(1, d - 1);
    const bar = "■".repeat(n) + "□".repeat(d - n);
    const correct = `${n}/${d}`;
    const distractors = new Set<string>();
    while (distractors.size < 3) {
      const variant = Math.random();
      let candidate: string;
      if (variant < 0.34 && n + 1 < d) candidate = `${n + 1}/${d}`;
      else if (variant < 0.67 && n - 1 > 0) candidate = `${n - 1}/${d}`;
      else candidate = `${n}/${d + randInt(1, 2)}`;
      if (candidate !== correct) distractors.add(candidate);
    }
    const choices = shuffle([correct, ...distractors]).map((label) => ({ label }));
    const correctIndex = choices.findIndex((c) => c.label === correct);
    rounds.push({ prompt: "Ποιο κλάσμα δείχνει η εικόνα;", promptEmoji: bar, choices, correctIndex });
  }
  return rounds;
}

export function numbersUpTo20Rounds(count = 8): Round[] {
  const rounds: Round[] = [];
  for (let i = 0; i < count; i++) {
    const a = randInt(1, 15);
    const b = randInt(1, 20 - a);
    const op = Math.random() < 0.5 ? "+" : "-";
    const [x, y] = op === "-" && a < b ? [b, a] : [a, b];
    const correct = op === "+" ? x + y : x - y;
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const candidate = correct + randInt(-3, 3);
      if (candidate >= 0 && candidate !== correct) distractors.add(candidate);
    }
    const choices = shuffle([correct, ...distractors]).map((n) => ({ label: String(n) }));
    const correctIndex = choices.findIndex((c) => c.label === String(correct));
    rounds.push({ prompt: `${x} ${op} ${y} = ;`, choices, correctIndex });
  }
  return rounds;
}

export type MathUnitGame = {
  slot: string;
  title: string;
  emoji: string;
  generate: () => Round[];
};

export type MathUnit = {
  id: string;
  title: string;
  emoji: string;
  grade: number;
  games: MathUnitGame[];
};

export const MATH_UNITS: MathUnit[] = [
  {
    id: "numbers-20",
    title: "Αριθμοί ως το 20",
    emoji: "🔢",
    grade: 1,
    games: [
      { slot: "practice", title: "Πράξεις ως το 20", emoji: "➕", generate: () => numbersUpTo20Rounds() },
      { slot: "numbers", title: "Ποσότητες", emoji: "🔵", generate: () => numberMatchRounds(1) },
      { slot: "shapes", title: "Μέτρημα Σχημάτων", emoji: "🔺", generate: () => shapeCountRounds(1) },
    ],
  },
  {
    id: "times-tables-2-5-10",
    title: "Προπαίδεια 2, 5 & 10",
    emoji: "✖️",
    grade: 2,
    games: [
      { slot: "practice", title: "Προπαίδεια 2-5-10", emoji: "✖️", generate: () => timesTableRounds([2, 5, 10]) },
      { slot: "mixed", title: "Πρόσθεση & Αφαίρεση ως το 100", emoji: "➕", generate: () => additionRounds(2) },
      { slot: "numbers", title: "Ποσότητες ως το 100", emoji: "🔵", generate: () => numberMatchRounds(2) },
    ],
  },
  {
    id: "times-tables-fractions",
    title: "Προπαίδεια & Κλάσματα",
    emoji: "🍕",
    grade: 3,
    games: [
      {
        slot: "practice",
        title: "Πλήρης Προπαίδεια",
        emoji: "✖️",
        generate: () => timesTableRounds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      },
      {
        slot: "fractions",
        title: "Κλάσματα",
        emoji: "🍕",
        generate: () => fractionVisualRounds([2, 3, 4, 5, 6, 8, 10]),
      },
      { slot: "numbers", title: "Ποσότητες ως το 50", emoji: "🔵", generate: () => numberMatchRounds(3) },
    ],
  },
  {
    id: "decimals-division",
    title: "Δεκαδικοί & Διαίρεση",
    emoji: "➗",
    grade: 4,
    games: [
      { slot: "division", title: "Διαίρεση", emoji: "➗", generate: () => divisionRounds() },
      { slot: "decimals", title: "Δεκαδικοί Αριθμοί", emoji: "🔟", generate: () => decimalAdditionRounds() },
      {
        slot: "fractions",
        title: "Κλάσματα",
        emoji: "🍕",
        generate: () => fractionVisualRounds([2, 3, 4, 5, 6, 8, 10, 12]),
      },
    ],
  },
];

export function getMathUnit(unitId: string): MathUnit | undefined {
  return MATH_UNITS.find((u) => u.id === unitId);
}

export function mathUnitForGrade(level: number): MathUnit | undefined {
  return MATH_UNITS.find((u) => u.grade === level);
}
