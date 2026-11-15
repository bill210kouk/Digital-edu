"use client";

import { useMemo, useState } from "react";

type Card = { id: number; value: string; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MemoryGame({
  values,
  onFinish,
}: {
  values: string[];
  onFinish: (score: number, maxScore: number) => void;
}) {
  const initialCards = useMemo<Card[]>(() => {
    const doubled = values.flatMap((v, i) => [
      { id: i * 2, value: v, matched: false },
      { id: i * 2 + 1, value: v, matched: false },
    ]);
    return shuffle(doubled);
  }, [values]);

  const [cards] = useState(initialCards);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [wrongMoves, setWrongMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const totalPairs = values.length;
  const maxScore = 100;

  function finishIfDone(newMatched: Set<number>) {
    if (newMatched.size === cards.length) {
      const score = Math.max(20, Math.round(100 - wrongMoves * 6));
      setTimeout(() => onFinish(Math.min(score, 100), maxScore), 500);
    }
  }

  function handleFlip(cardId: number) {
    if (busy || matchedIds.has(cardId) || flipped.includes(cardId)) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setBusy(true);
      const [firstId, secondId] = newFlipped;
      const first = cards.find((c) => c.id === firstId)!;
      const second = cards.find((c) => c.id === secondId)!;

      if (first.value === second.value) {
        const newMatched = new Set(matchedIds);
        newMatched.add(firstId);
        newMatched.add(secondId);
        setTimeout(() => {
          setMatchedIds(newMatched);
          setFlipped([]);
          setBusy(false);
          finishIfDone(newMatched);
        }, 500);
      } else {
        setWrongMoves((w) => w + 1);
        setTimeout(() => {
          setFlipped([]);
          setBusy(false);
        }, 800);
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between text-slate-500 font-medium">
        <span>Ζευγάρια: {matchedIds.size / 2} / {totalPairs}</span>
        <span>❌ Λάθη: {wrongMoves}</span>
      </div>

      <div
        className="grid gap-3 w-full"
        style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.ceil(Math.sqrt(cards.length)))}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matchedIds.has(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`aspect-square rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow transition ${
                matchedIds.has(card.id)
                  ? "bg-green-100 text-green-700 border-2 border-green-400"
                  : isFlipped
                  ? "bg-amber-100 text-amber-900 border-2 border-amber-300"
                  : "bg-sky-500 text-sky-500 hover:bg-sky-600"
              }`}
            >
              {isFlipped ? card.value : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
