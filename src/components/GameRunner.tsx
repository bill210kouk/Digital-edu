"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  additionRounds,
  englishMemoryPairs,
  fillLetterRounds,
  getMathUnit,
  getVocabUnit,
  numberMatchRounds,
  shapeCountRounds,
  syllableMemoryPairs,
  translateQuizRounds,
  unitHighlightRounds,
  unitListenRounds,
  unitMissingLetterRounds,
  unitPictureRounds,
  wordImageEnRounds,
  wordMatchRounds,
} from "@/lib/gameData";
import { parseMathUnitKey, parseUnitGameKey } from "@/lib/constants";
import MultipleChoiceGame from "@/components/games/MultipleChoiceGame";
import MemoryGame from "@/components/games/MemoryGame";
import WordHighlightGame from "@/components/games/WordHighlightGame";

type Props = {
  subjectId: string;
  studentId: string;
  studentName: string;
  gameKey: string;
  gameTitle: string;
  gameEmoji: string;
  gradeLevel: number;
  backHref: string;
};

export default function GameRunner({
  subjectId,
  studentId,
  studentName,
  gameKey,
  gameTitle,
  gameEmoji,
  gradeLevel,
  backHref,
}: Props) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<GameContent | null>(null);

  useEffect(() => {
    // Content uses Math.random, so it must only be generated client-side
    // (after mount) to avoid a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContent(generateContent(gameKey, gradeLevel));
  }, [gameKey, gradeLevel, attempt]);

  async function handleFinish(score: number, maxScore: number) {
    setResult({ score, maxScore });
    setSaving(true);
    try {
      await fetch(`/api/subjects/${subjectId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, gameKey, score, maxScore }),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleReplay() {
    setResult(null);
    setAttempt((a) => a + 1);
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-sky-100 to-amber-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href={backHref} className="text-sky-700 font-medium hover:underline">
            ← Πίσω στο μάθημα
          </Link>
          <span className="font-heading font-bold text-slate-600">🧒 {studentName}</span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-center text-sky-700 mb-6">
          {gameEmoji} {gameTitle}
        </h1>

        {result ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center animate-pop">
            <div className="text-6xl mb-4">
              {result.score / result.maxScore >= 0.8 ? "🏆" : result.score / result.maxScore >= 0.5 ? "🎉" : "💪"}
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-700 mb-2">
              {studentName}, το σκορ σου είναι:
            </h2>
            <p className="text-4xl font-extrabold text-amber-500 mb-6">
              {result.score} / {result.maxScore}
            </p>
            {saving && <p className="text-slate-400 text-sm mb-4">Αποθήκευση αποτελέσματος...</p>}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleReplay}
                className="rounded-full bg-sky-600 text-white px-6 py-3 font-semibold hover:bg-sky-700 transition"
              >
                Παίξε Ξανά 🔁
              </button>
              <Link
                href={backHref}
                className="rounded-full bg-white border-2 border-sky-600 text-sky-700 px-6 py-3 font-semibold hover:bg-sky-50 transition"
              >
                Πίσω στο μάθημα
              </Link>
            </div>
          </div>
        ) : !content ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-slate-400">
            Φόρτωση παιχνιδιού...
          </div>
        ) : content.kind === "choice" ? (
          <MultipleChoiceGame rounds={content.rounds} onFinish={handleFinish} />
        ) : content.kind === "highlight" ? (
          <WordHighlightGame rounds={content.rounds} onFinish={handleFinish} />
        ) : (
          <MemoryGame values={content.values} onFinish={handleFinish} />
        )}
      </div>
    </main>
  );
}

type GameContent =
  | { kind: "choice"; rounds: ReturnType<typeof wordMatchRounds> }
  | { kind: "highlight"; rounds: ReturnType<typeof unitHighlightRounds> }
  | { kind: "memory"; values: string[] };

function generateContent(gameKey: string, gradeLevel: number): GameContent {
  const unitGame = parseUnitGameKey(gameKey);
  if (unitGame) {
    const unit = getVocabUnit(unitGame.unitId, gradeLevel);
    if (!unit) return { kind: "choice", rounds: [] };
    switch (unitGame.type) {
      case "highlight":
        return { kind: "highlight", rounds: unitHighlightRounds(unit) };
      case "picture":
        return { kind: "choice", rounds: unitPictureRounds(unit) };
      case "missing":
        return { kind: "choice", rounds: unitMissingLetterRounds(unit) };
      case "listen":
        return { kind: "choice", rounds: unitListenRounds(unit) };
    }
  }

  const mathUnitGame = parseMathUnitKey(gameKey);
  if (mathUnitGame) {
    const unit = getMathUnit(mathUnitGame.unitId);
    const game = unit?.games.find((g) => g.slot === mathUnitGame.slot);
    if (game) return { kind: "choice", rounds: game.generate() };
    return { kind: "choice", rounds: [] };
  }

  switch (gameKey) {
    case "word-match":
      return { kind: "choice", rounds: wordMatchRounds(gradeLevel) };
    case "fill-letter":
      return { kind: "choice", rounds: fillLetterRounds(gradeLevel) };
    case "syllable-memory":
      return { kind: "memory", values: syllableMemoryPairs(gradeLevel) };
    case "addition":
      return { kind: "choice", rounds: additionRounds(gradeLevel) };
    case "number-match":
      return { kind: "choice", rounds: numberMatchRounds(gradeLevel) };
    case "shape-count":
      return { kind: "choice", rounds: shapeCountRounds(gradeLevel) };
    case "word-image-en":
      return { kind: "choice", rounds: wordImageEnRounds(gradeLevel) };
    case "translate-quiz":
      return { kind: "choice", rounds: translateQuizRounds(gradeLevel) };
    case "english-memory":
      return { kind: "memory", values: englishMemoryPairs(gradeLevel) };
    default:
      return { kind: "choice", rounds: [] };
  }
}
