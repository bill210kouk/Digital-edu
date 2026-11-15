"use client";

import { useState, type ReactNode } from "react";
import type { DoneFn, FinishFn, Review } from "@/lib/activities/types";
import { speak } from "@/lib/activities/util";

export const btn =
  "rounded-full px-5 py-2 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed";
export const btnPrimary = `${btn} bg-amber-400 text-amber-900 hover:bg-amber-300`;
export const btnBrand = `${btn} bg-sky-600 text-white hover:bg-sky-700`;
export const btnGhost = `${btn} border border-slate-300 text-slate-700 hover:bg-slate-50`;
export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400";

export function ListenBtn({ text }: { text: string }) {
  return (
    <button type="button" onClick={() => speak(text)} className={`${btnGhost} !px-3 !py-1 text-sm`} aria-label="Άκουσε">
      🔊 Άκουσε
    </button>
  );
}

export function Feedback({ kind, children }: { kind: "good" | "soft"; children: ReactNode }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl px-4 py-3 font-bold ${
        kind === "good" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"
      }`}
    >
      {children}
    </div>
  );
}

/** Παίζει ερώτηση-ερώτηση και μαζεύει σκορ «με την πρώτη» και ανασκόπηση. */
export function Seq<T>({
  items,
  onFinish,
  children,
}: {
  items: T[];
  onFinish: FinishFn;
  children: (item: T, done: DoneFn, index: number) => ReactNode;
}) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  if (items.length === 0) return <p className="text-slate-500">Η δραστηριότητα δεν έχει περιεχόμενο.</p>;

  const done: DoneFn = (first, rev) => {
    const s = score + (first ? 1 : 0);
    const r = rev ? [...reviews, { ok: first, ...rev }] : reviews;
    if (i + 1 >= items.length) {
      onFinish(s, items.length, "", r);
      return;
    }
    setScore(s);
    setReviews(r);
    setI(i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden" aria-hidden>
          <div className="h-full bg-sky-500 transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-slate-500">
          {i + 1} / {items.length}
        </span>
      </div>
      <div key={i}>{children(items[i], done, i)}</div>
    </div>
  );
}

export function ResultScreen({
  score,
  total,
  note,
  review,
  onAgain,
  extra,
}: {
  score: number;
  total: number;
  note?: string;
  review?: Review[];
  onAgain: () => void;
  extra?: ReactNode;
}) {
  const pct = total ? Math.round((score / total) * 100) : 100;
  const head = !total
    ? "Μπράβο!"
    : pct >= 90
      ? "Εξαιρετικά!"
      : pct >= 70
        ? "Μπράβο!"
        : pct >= 50
          ? "Καλή προσπάθεια!"
          : "Δοκίμασε ξανά, θα τα καταφέρεις!";
  return (
    <section className="text-center space-y-3">
      <h2 className="font-heading text-3xl font-extrabold text-sky-700">{head}</h2>
      {total > 0 && (
        <>
          <p className="font-heading text-6xl font-extrabold text-amber-500">{pct}%</p>
          <p className="text-lg font-bold text-slate-600">
            Σωστά με την πρώτη: {score} από {total}
          </p>
        </>
      )}
      {note && <p className="text-slate-600">{note}</p>}
      {review && review.length > 0 && (
        <div className="text-left pt-3">
          <h3 className="font-heading text-xl font-bold text-slate-700 mb-2">Ανασκόπηση απαντήσεων</h3>
          <ol className="space-y-3">
            {review.map((r, k) => (
              <li
                key={k}
                className={`rounded-xl border-2 p-3 ${r.ok ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"}`}
              >
                <div className="flex gap-2 font-bold text-slate-800">
                  <span aria-label={r.ok ? "Σωστό" : "Λάθος"}>{r.ok ? "✅" : "❌"}</span>
                  <span>{r.q}</span>
                </div>
                <p className="ml-7 text-sm text-slate-700">Η απάντησή σου: {r.yours}</p>
                {!r.ok && r.correct && <p className="ml-7 text-sm text-slate-700">Σωστή απάντηση: {r.correct}</p>}
                {r.why && <p className="ml-7 text-sm text-slate-700">Εξήγηση: {r.why}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button type="button" onClick={onAgain} className={btnPrimary}>
          Παίξε ξανά
        </button>
        {extra}
      </div>
    </section>
  );
}
