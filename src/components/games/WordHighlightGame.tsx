"use client";

import { useState } from "react";
import type { HighlightRound } from "@/lib/gameData";

export default function WordHighlightGame({
  rounds,
  onFinish,
}: {
  rounds: HighlightRound[];
  onFinish: (score: number, maxScore: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  const round = rounds[index];
  const maxScore = rounds.length * 10;

  function toggle(i: number) {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleCheck() {
    if (checked) return;
    let correctCount = 0;
    round.items.forEach((item, i) => {
      const isSelected = selected.has(i);
      if (isSelected === item.isMatch) correctCount += 1;
    });
    const roundScore = Math.round((correctCount / round.items.length) * 10);
    setScore((s) => s + roundScore);
    setChecked(true);

    setTimeout(() => {
      if (index + 1 < rounds.length) {
        setIndex((i) => i + 1);
        setSelected(new Set());
        setChecked(false);
      } else {
        onFinish(score + roundScore, maxScore);
      }
    }, 1400);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between text-slate-500 font-medium">
        <span>
          Γύρος {index + 1} / {rounds.length}
        </span>
        <span>⭐ {score}</span>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 w-full text-center animate-pop">
        <p className="font-heading text-xl sm:text-2xl font-bold text-slate-700">
          Βρες τις λέξεις που έχουν το γράμμα{" "}
          <span className="text-amber-500">{round.letter}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
        {round.items.map((item, i) => {
          const isSelected = selected.has(i);
          let style = "bg-white hover:bg-sky-50 border-slate-200 text-slate-700";
          if (checked) {
            if (item.isMatch) style = "bg-green-100 border-green-400 text-green-700";
            else if (isSelected) style = "bg-red-100 border-red-400 text-red-700";
          } else if (isSelected) {
            style = "bg-amber-100 border-amber-400 text-amber-800";
          }
          return (
            <button
              key={i}
              disabled={checked}
              onClick={() => toggle(i)}
              className={`rounded-2xl border-2 px-4 py-5 text-lg font-bold shadow transition ${style}`}
            >
              <div className="text-3xl mb-1">{item.emoji}</div>
              {item.word}
            </button>
          );
        })}
      </div>

      {!checked ? (
        <button
          onClick={handleCheck}
          className="rounded-full bg-sky-600 text-white px-8 py-3 font-bold hover:bg-sky-700 transition"
        >
          Έλεγξε! ✅
        </button>
      ) : (
        <p className="font-heading text-xl font-bold text-green-600">Μπράβο! 🎉</p>
      )}
    </div>
  );
}
