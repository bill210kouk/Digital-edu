"use client";

import { useEffect, useState } from "react";
import type { Round } from "@/lib/gameData";

export default function MultipleChoiceGame({
  rounds,
  onFinish,
}: {
  rounds: Round[];
  onFinish: (score: number, maxScore: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const round = rounds[index];
  const maxScore = rounds.length * 10;

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "el-GR";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (round?.speak) speak(round.speak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function handleChoice(choiceIndex: number) {
    if (selected !== null) return;
    setSelected(choiceIndex);
    const isCorrect = choiceIndex === round.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    const newScore = score + (isCorrect ? 10 : 0);
    setScore(newScore);

    setTimeout(() => {
      if (index + 1 < rounds.length) {
        setIndex((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      } else {
        onFinish(newScore, maxScore);
      }
    }, 900);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between text-slate-500 font-medium">
        <span>
          Ερώτηση {index + 1} / {rounds.length}
        </span>
        <span>⭐ {score}</span>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 w-full text-center animate-pop">
        {round.promptEmoji && (
          <div className="text-5xl mb-4 break-words">{round.promptEmoji}</div>
        )}
        <p className="font-heading text-xl sm:text-2xl font-bold text-slate-700">
          {round.prompt}
        </p>
        {round.speak && (
          <button
            type="button"
            onClick={() => speak(round.speak!)}
            className="mt-4 rounded-full bg-sky-100 text-sky-700 px-5 py-2 font-semibold hover:bg-sky-200 transition"
          >
            🔊 Παίξε τον ήχο
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {round.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrectChoice = i === round.correctIndex;
          let style = "bg-white hover:bg-sky-50 text-slate-700 border-slate-200";
          if (selected !== null) {
            if (isCorrectChoice) style = "bg-green-100 border-green-400 text-green-700";
            else if (isSelected) style = "bg-red-100 border-red-400 text-red-700";
          }
          return (
            <button
              key={i}
              disabled={selected !== null}
              onClick={() => handleChoice(i)}
              className={`rounded-2xl border-2 px-4 py-5 text-lg font-bold shadow transition ${style}`}
            >
              {choice.emoji && <div className="text-3xl mb-1">{choice.emoji}</div>}
              {choice.label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p
          className={`font-heading text-xl font-bold ${
            feedback === "correct" ? "text-green-600" : "text-red-500"
          }`}
        >
          {feedback === "correct" ? "Μπράβο! 🎉" : "Ωχ, δοκίμασε την επόμενη! 💪"}
        </p>
      )}
    </div>
  );
}
