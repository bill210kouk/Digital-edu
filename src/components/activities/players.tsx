"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CrosswordData,
  FillData,
  FinishFn,
  MathData,
  McData,
  MemoryData,
  OpenData,
  WheelData,
} from "@/lib/activities/types";
import { norm, shuffle } from "@/lib/activities/util";
import { crossEntries, memPairs, openItems, parseFill, wheelItems } from "@/lib/activities/parse";
import { mkMath } from "@/lib/activities/math";
import { genCross } from "@/lib/activities/crossword";
import { btnBrand, btnGhost, btnPrimary, Feedback, inputCls, ListenBtn, Seq } from "@/components/activities/ui";

/* ---------- Πολλαπλής επιλογής ---------- */
export function McPlayer({ data, onFinish }: { data: McData; onFinish: FinishFn }) {
  const qs = useMemo(() => {
    const base = data.questions
      .map((q) => ({ q: q.q, why: q.why ?? "", options: q.options.filter((o) => o.t.trim()) }))
      .filter((q) => q.q.trim() && q.options.length >= 2 && q.options.some((o) => o.ok));
    return data.shuffleQ ? shuffle(base) : base;
  }, [data]);

  return (
    <Seq items={qs} onFinish={onFinish}>
      {(q, done) => <McQuestion q={q} data={data} done={done} />}
    </Seq>
  );
}

function McQuestion({
  q,
  data,
  done,
}: {
  q: { q: string; why: string; options: { t: string; ok: boolean }[] };
  data: McData;
  done: (first: boolean, rev?: { q: string; yours: string; correct?: string; why?: string }) => void;
}) {
  const opts = useMemo(() => (data.shuffleO ? shuffle(q.options) : q.options), [q, data.shuffleO]);
  const multi = opts.filter((o) => o.ok).length > 1;
  const correctTxt = opts.filter((o) => o.ok).map((o) => o.t).join(", ");
  const [sel, setSel] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [tried, setTried] = useState(false);
  const [first, setFirst] = useState<string | null>(null);
  const [fb, setFb] = useState<{ kind: "good" | "soft"; text: string } | null>(null);
  const [finished, setFinished] = useState(false);

  const end = (text: string, good: boolean) => {
    setFb({ kind: good ? "good" : "soft", text });
    setFinished(true);
  };

  const pick = (i: number) => {
    if (finished) return;
    if (multi) {
      setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
      return;
    }
    const yours = first ?? opts[i].t;
    if (first === null) setFirst(yours);
    if (opts[i].ok) end(tried ? "Σωστά, τώρα το βρήκες!" : "Μπράβο! Σωστή απάντηση.", true);
    else if (data.test) {
      setWrong([i]);
      setTried(true);
      end("Λάθος. Η σωστή απάντηση είναι: " + correctTxt, false);
    } else {
      setWrong((w) => [...w, i]);
      setTried(true);
      setFb({ kind: "soft", text: "Δεν πειράζει, δοκίμασε ξανά." });
    }
  };

  const check = () => {
    const yours = first ?? (sel.length ? [...sel].sort().map((i) => opts[i].t).join(", ") : "(καμία)");
    if (first === null) setFirst(yours);
    const right = opts.every((o, i) => o.ok === sel.includes(i));
    if (right) end(tried ? "Σωστά, τώρα τις βρήκες!" : "Μπράβο! Βρήκες όλες τις σωστές.", true);
    else if (data.test) {
      setWrong(sel.filter((i) => !opts[i].ok));
      setTried(true);
      end("Όχι ακριβώς. Οι σωστές είναι: " + correctTxt, false);
    } else {
      setTried(true);
      setFb({ kind: "soft", text: "Όχι ακόμα. Διάβασε ξανά και διάλεξε όλες τις σωστές." });
    }
  };

  const state = (i: number) => {
    if (finished && opts[i].ok) return "border-green-500 bg-green-50";
    if (wrong.includes(i)) return "border-red-400 bg-red-50";
    if (sel.includes(i)) return "border-sky-500 bg-sky-50";
    return "border-slate-200 bg-white hover:border-sky-300";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-500">{multi ? "Διάλεξε όλες τις σωστές" : "Διάλεξε μία απάντηση"}</span>
        <ListenBtn text={q.q} />
      </div>
      <p className="text-xl font-bold text-slate-800">{q.q}</p>
      <div className="grid gap-2">
        {opts.map((o, i) => (
          <button
            key={i}
            type="button"
            disabled={finished || wrong.includes(i)}
            aria-pressed={multi ? sel.includes(i) : undefined}
            onClick={() => pick(i)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-semibold transition ${state(i)}`}
          >
            <span className="grid place-items-center w-8 h-8 rounded-full bg-slate-100 text-sm font-extrabold">
              {"ΑΒΓΔΕΖΗΘ"[i] ?? i + 1}
            </span>
            <span>{o.t}</span>
          </button>
        ))}
      </div>
      {fb && <Feedback kind={fb.kind}>{fb.text}</Feedback>}
      {finished && q.why && (
        <div className="rounded-lg border-l-4 border-sky-500 bg-sky-50 px-4 py-3 font-medium text-slate-700">{q.why}</div>
      )}
      <div className="flex gap-3">
        {multi && !finished && (
          <button type="button" onClick={check} className={btnBrand}>
            Έλεγχος
          </button>
        )}
        {finished && (
          <button
            type="button"
            autoFocus
            onClick={() => done(!tried, { q: q.q, yours: first ?? correctTxt, correct: correctTxt, why: q.why })}
            className={btnPrimary}
          >
            Επόμενο
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Συμπλήρωση κενού ---------- */
export function FillPlayer({ data, onFinish }: { data: FillData; onFinish: FinishFn }) {
  const items = useMemo(() => {
    const p = parseFill(data.text);
    return data.shuffle ? shuffle(p) : p;
  }, [data]);
  return (
    <Seq items={items} onFinish={onFinish}>
      {(parts, done) => <FillSentence parts={parts} data={data} done={done} />}
    </Seq>
  );
}

function FillSentence({
  parts,
  data,
  done,
}: {
  parts: ReturnType<typeof parseFill>[number];
  data: FillData;
  done: (first: boolean, rev?: { q: string; yours: string; correct?: string }) => void;
}) {
  const blanks = parts.filter((p): p is { blank: string[] } => "blank" in p);
  const [vals, setVals] = useState<string[]>(() => blanks.map(() => ""));
  const [marks, setMarks] = useState<(boolean | null)[]>(() => blanks.map(() => null));
  const [tried, setTried] = useState(false);
  const [first, setFirst] = useState<string | null>(null);
  const [fb, setFb] = useState<{ kind: "good" | "soft"; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const bank = useMemo(() => shuffle(blanks.map((b) => b.blank[0])), [blanks]);
  const [used, setUsed] = useState<Record<number, number>>({}); // blankIdx -> bankIdx

  const correctTxt = blanks.map((b) => b.blank[0]).join(", ");
  const sentenceTxt = parts.map((p) => ("blank" in p ? "____" : p.t)).join("");
  const spoken = parts.map((p) => ("blank" in p ? "κενό" : p.t)).join("");

  const setVal = (i: number, v: string) => setVals((a) => a.map((x, k) => (k === i ? v : x)));

  const place = (bi: number) => {
    const slot = blanks.findIndex((_, k) => !(k in used));
    if (slot < 0) return;
    setUsed((u) => ({ ...u, [slot]: bi }));
    setVal(slot, bank[bi]);
  };
  const unplace = (slot: number) => {
    if (finished) return;
    setUsed((u) => {
      const n = { ...u };
      delete n[slot];
      return n;
    });
    setVal(slot, "");
    setMarks((m) => m.map((x, k) => (k === slot ? null : x)));
  };

  const check = () => {
    const yours = first ?? vals.map((v) => v || "—").join(", ");
    if (first === null) setFirst(yours);
    const res = blanks.map((b, k) => b.blank.map(norm).includes(norm(vals[k])));
    setMarks(res);
    const ok = res.every(Boolean);
    if (ok) {
      setFb({ kind: "good", text: tried ? "Σωστά, τώρα το βρήκες!" : "Μπράβο! Όλα σωστά." });
      setFinished(true);
    } else if (data.test) {
      setTried(true);
      setFb({ kind: "soft", text: "Λάθος. Σωστή απάντηση: " + correctTxt });
      setFinished(true);
    } else {
      setTried(true);
      setFb({ kind: "soft", text: "Σχεδόν! Δες ξανά τα κενά που έχουν χρώμα." });
    }
  };

  let bi = -1;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-500">
          {data.bank ? "Πάτα μια λέξη για να μπει στο κενό" : "Γράψε τη λέξη που λείπει"}
        </span>
        <ListenBtn text={spoken} />
      </div>
      <p className="text-xl font-bold text-slate-800 leading-[2.6rem]">
        {parts.map((p, k) => {
          if (!("blank" in p)) return <span key={k}>{p.t}</span>;
          bi++;
          const slot = bi;
          const m = marks[slot];
          const cls = `mx-1 inline-block min-w-20 rounded-lg border-2 px-2 py-1 text-center align-middle ${
            m === true ? "border-green-500 bg-green-50" : m === false ? "border-red-400 bg-red-50" : "border-sky-300 bg-white"
          }`;
          return data.bank ? (
            <button key={k} type="button" aria-label="κενό" onClick={() => unplace(slot)} className={cls}>
              {vals[slot] || "    "}
            </button>
          ) : (
            <input
              key={k}
              type="text"
              aria-label="κενό"
              value={vals[slot]}
              readOnly={finished}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(e) => setVal(slot, e.target.value)}
              style={{ width: `${Math.max(5, blanks[slot].blank[0].length + 2)}ch` }}
              className={cls}
            />
          );
        })}
      </p>
      {data.bank && (
        <div className="flex flex-wrap gap-2">
          {bank.map((w, k) => (
            <button
              key={k}
              type="button"
              disabled={Object.values(used).includes(k) || finished}
              onClick={() => place(k)}
              className={`${btnGhost} !py-1`}
            >
              {w}
            </button>
          ))}
        </div>
      )}
      {fb && <Feedback kind={fb.kind}>{fb.text}</Feedback>}
      <div className="flex gap-3">
        {!finished && (
          <button type="button" onClick={check} className={btnBrand}>
            Έλεγχος
          </button>
        )}
        {finished && (
          <button
            type="button"
            autoFocus
            onClick={() => done(!tried, { q: sentenceTxt, yours: first ?? correctTxt, correct: correctTxt })}
            className={btnPrimary}
          >
            Επόμενο
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Ανοιχτού τύπου ---------- */
export function OpenPlayer({ data, onFinish }: { data: OpenData; onFinish: FinishFn }) {
  const items = useMemo(() => openItems(data.text), [data]);
  return (
    <Seq items={items} onFinish={onFinish}>
      {(it, done) => <OpenQuestion it={it} done={done} />}
    </Seq>
  );
}

function OpenQuestion({
  it,
  done,
}: {
  it: ReturnType<typeof openItems>[number];
  done: (first: boolean, rev?: { q: string; yours: string; correct?: string }) => void;
}) {
  const [text, setText] = useState("");
  const [shown, setShown] = useState(false);
  const hits = it.kw.filter((k) => norm(text).includes(norm(k)));
  const rev = (ok: boolean) => done(ok, { q: it.q, yours: text.trim() || "(χωρίς απάντηση)", correct: it.a });
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ListenBtn text={it.q} />
      </div>
      <p className="text-xl font-bold text-slate-800">{it.q}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Γράψε την απάντησή σου..."
        aria-label="Η απάντησή σου"
        className={inputCls}
      />
      {!shown ? (
        <button type="button" onClick={() => setShown(true)} className={btnBrand}>
          Δες τη σωστή απάντηση
        </button>
      ) : (
        <>
          <div className="rounded-xl bg-sky-50 border-l-4 border-sky-500 px-4 py-3">
            <p className="font-bold text-slate-700">Σωστή απάντηση</p>
            <p className="text-slate-700">{it.a || "(δεν έχει οριστεί)"}</p>
            {it.kw.length > 0 && (
              <p className="text-sm text-slate-600 mt-1">
                Λέξεις-κλειδιά που βρήκες: {hits.length} από {it.kw.length}
                {hits.length ? ` (${hits.join(", ")})` : ""}
              </p>
            )}
          </div>
          <p className="font-bold text-slate-700">Η απάντησή σου ήταν σωστή;</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => rev(true)} className={btnPrimary}>
              Ήταν σωστή
            </button>
            <button type="button" onClick={() => rev(false)} className={btnGhost}>
              Θα την ξαναδώ
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Πράξεις ---------- */
export function MathPlayer({ data, onFinish }: { data: MathData; onFinish: FinishFn }) {
  const items = useMemo(
    () => Array.from({ length: Math.max(1, Math.min(50, Number(data.count) || 10)) }, () => mkMath(data)),
    [data]
  );
  return (
    <Seq items={items} onFinish={onFinish}>
      {(it, done) => <MathQuestion it={it} test={!!data.test} done={done} />}
    </Seq>
  );
}

function MathQuestion({
  it,
  test,
  done,
}: {
  it: { text: string; ans: number };
  test: boolean;
  done: (first: boolean, rev?: { q: string; yours: string; correct?: string }) => void;
}) {
  const [v, setV] = useState("");
  const [tried, setTried] = useState(false);
  const [first, setFirst] = useState<string | null>(null);
  const [fb, setFb] = useState<{ kind: "good" | "soft"; text: string } | null>(null);
  const [finished, setFinished] = useState(false);

  const check = () => {
    if (first === null) setFirst(v.trim());
    if (Number(v.replace(",", ".")) === it.ans && v.trim() !== "") {
      setFb({ kind: "good", text: tried ? "Σωστά, τώρα το βρήκες!" : "Μπράβο!" });
      setFinished(true);
    } else if (test) {
      setTried(true);
      setFb({ kind: "soft", text: "Λάθος. Η σωστή απάντηση είναι " + it.ans });
      setFinished(true);
    } else {
      setTried(true);
      setFb({ kind: "soft", text: "Σχεδόν! Δοκίμασε ξανά." });
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="font-heading text-4xl font-extrabold text-slate-800">{it.text}</p>
      <input
        type="text"
        inputMode="numeric"
        value={v}
        readOnly={finished}
        autoFocus
        aria-label="Απάντηση"
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !finished && check()}
        className={`${inputCls} !w-40 mx-auto text-center text-2xl`}
      />
      {fb && <Feedback kind={fb.kind}>{fb.text}</Feedback>}
      <div className="flex justify-center gap-3">
        {!finished && (
          <button type="button" onClick={check} className={btnBrand}>
            Έλεγχος
          </button>
        )}
        {finished && (
          <button
            type="button"
            onClick={() => done(!tried, { q: it.text, yours: first || String(it.ans), correct: String(it.ans) })}
            className={btnPrimary}
          >
            Επόμενη
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Σταυρόλεξο ---------- */
export function CrossPlayer({ data, onFinish }: { data: CrosswordData; onFinish: FinishFn }) {
  const cw = useMemo(() => genCross(crossEntries(data.text)), [data]);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [fb, setFb] = useState<{ kind: "good" | "soft"; text: string } | null>(null);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!cw.words.length) return <p className="text-slate-500">Χρειάζονται τουλάχιστον δύο λέξεις.</p>;

  const check = () => {
    const m: Record<string, boolean> = {};
    let wrong = 0;
    let empty = 0;
    cw.cells.forEach((ch, k) => {
      const v = (vals[k] ?? "").trim();
      if (!v) {
        empty++;
        return;
      }
      m[k] = v === ch;
      if (v !== ch) wrong++;
    });
    setMarks(m);
    if (!wrong && !empty) {
      setFb({ kind: "good", text: "Μπράβο! Έλυσες το σταυρόλεξο!" });
      setTimeout(() => onFinish(0, 0, "Έλυσες ολόκληρο το σταυρόλεξο."), 900);
    } else {
      setFb({
        kind: "soft",
        text: wrong ? `Υπάρχουν ${wrong} λάθος γράμματα (με κόκκινο).` : `Έχουν μείνει ${empty} κενά τετράγωνα.`,
      });
    }
  };

  const across = cw.words.filter((w) => w.dir === "a").sort((a, b) => a.num - b.num);
  const down = cw.words.filter((w) => w.dir === "d").sort((a, b) => a.num - b.num);
  const focus = (k: string) => refs.current[k]?.focus();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 mx-auto w-fit"
          style={{ gridTemplateColumns: `repeat(${cw.cols}, 2.4rem)` }}
        >
          {Array.from({ length: cw.rows * cw.cols }, (_, n) => {
            const r = Math.floor(n / cw.cols);
            const c = n % cw.cols;
            const k = r + "," + c;
            if (!cw.cells.has(k)) return <div key={k} className="w-[2.4rem] h-[2.4rem]" />;
            const m = marks[k];
            return (
              <div key={k} className="relative">
                {cw.nums.has(k) && (
                  <span className="absolute top-0 left-0.5 text-[0.6rem] font-bold text-slate-500 pointer-events-none">
                    {cw.nums.get(k)}
                  </span>
                )}
                <input
                  ref={(el) => {
                    refs.current[k] = el;
                  }}
                  value={vals[k] ?? ""}
                  maxLength={1}
                  aria-label={`Γράμμα γραμμή ${r + 1} στήλη ${c + 1}`}
                  onChange={(e) => {
                    const ch = e.target.value
                      .normalize("NFD")
                      .replace(/[̀-ͯ]/g, "")
                      .toUpperCase()
                      .slice(-1);
                    setVals((v) => ({ ...v, [k]: ch }));
                    setMarks((x) => {
                      const n2 = { ...x };
                      delete n2[k];
                      return n2;
                    });
                                    if (ch) {
                      if (cw.cells.has(r + "," + (c + 1))) focus(r + "," + (c + 1));
                      else focus(r + 1 + "," + c);
                    }
                  }}
                  className={`w-[2.4rem] h-[2.4rem] rounded-md border-2 text-center font-extrabold uppercase focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    m === true ? "border-green-500 bg-green-50" : m === false ? "border-red-400 bg-red-50" : "border-slate-400 bg-white"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="font-bold text-slate-700 mb-1">Οριζόντια →</h3>
          <ul className="space-y-1">
            {across.map((w) => (
              <li key={"a" + w.num}>
                <b>{w.num}.</b> {w.clue || `(${w.w.length} γράμματα)`}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-slate-700 mb-1">Κάθετα ↓</h3>
          <ul className="space-y-1">
            {down.map((w) => (
              <li key={"d" + w.num}>
                <b>{w.num}.</b> {w.clue || `(${w.w.length} γράμματα)`}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {cw.unplaced.length > 0 && (
        <p className="text-sm text-amber-700">Δεν χωρούσαν στο πλέγμα: {cw.unplaced.map((e) => e.raw).join(", ")}</p>
      )}
      {fb && <Feedback kind={fb.kind}>{fb.text}</Feedback>}
      <div className="flex gap-3">
        <button type="button" onClick={check} className={btnBrand}>
          Έλεγχος
        </button>
        <button
          type="button"
          onClick={() => {
            const all: Record<string, string> = {};
            cw.cells.forEach((ch, k) => (all[k] = ch));
            setVals(all);
            setMarks({});
          }}
          className={btnGhost}
        >
          Δείξε τη λύση
        </button>
      </div>
    </div>
  );
}

/* ---------- Τροχός ---------- */
const COLORS = ["#0ea5e9", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export function WheelPlayer({ data, onFinish }: { data: WheelData; onFinish: FinishFn }) {
  const all = useMemo(() => wheelItems(data.text), [data]);
  const [items, setItems] = useState(all);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [cur, setCur] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [count, setCount] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const S = cv.width;
    const R = S / 2 - 6;
    ctx.clearRect(0, 0, S, S);
    const n = items.length || 1;
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const a0 = angle + i * step;
      ctx.beginPath();
      ctx.moveTo(S / 2, S / 2);
      ctx.arc(S / 2, S / 2, R, a0, a0 + step);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
      if (items[i]) {
        ctx.save();
        ctx.translate(S / 2, S / 2);
        ctx.rotate(a0 + step / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(items[i].label.slice(0, 16), R - 14, 6);
        ctx.restore();
      }
    }
  }, [angle, items]);

  const spin = () => {
    if (spinning || !items.length) return;
    setSpinning(true);
    setShown(false);
    setCur(null);
    const n = items.length;
    const step = (Math.PI * 2) / n;
    const target = Math.floor(Math.random() * n);
    // ο δείκτης είναι στην κορυφή (-π/2): το κέντρο του τομέα target πρέπει να καταλήξει εκεί
    const TAU = Math.PI * 2;
    const base = -Math.PI / 2 - (target + 0.5) * step;
    const start = angle;
    const end = start + TAU * (5 + Math.floor(Math.random() * 3)) + ((((base - start) % TAU) + TAU) % TAU);
    const from = start;
    const dur = 3500;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setAngle(from + (end - from) * e);
      if (p < 1) requestAnimationFrame(tick);
      else {
        setSpinning(false);
        setCur(target);
        setCount((c) => c + 1);
      }
    };
    requestAnimationFrame(tick);
  };

  const next = () => {
    if (cur !== null && data.remove) {
      const rest = items.filter((_, i) => i !== cur);
      setItems(rest);
      if (!rest.length) {
        onFinish(0, 0, `Ολοκλήρωσες και τις ${all.length} ερωτήσεις του τροχού.`);
        return;
      }
    }
    setCur(null);
    setShown(false);
  };

  if (!all.length) return <p className="text-slate-500">Ο τροχός δεν έχει στοιχεία.</p>;
  const it = cur !== null ? items[cur] : null;
  return (
    <div className="space-y-4 text-center">
      <div className="relative w-fit mx-auto">
        <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-10 text-3xl text-slate-800" aria-hidden>
          ▼
        </div>
        <canvas ref={canvas} width={340} height={340} role="img" aria-label="Τροχός" className="max-w-full" />
      </div>
      {!it && (
        <button type="button" onClick={spin} disabled={spinning} className={btnPrimary}>
          {spinning ? "Γυρίζει..." : "Γύρνα τον τροχό!"}
        </button>
      )}
      {it && (
        <div className="rounded-2xl bg-sky-50 p-4 space-y-3">
          <p className="font-heading text-2xl font-extrabold text-sky-700">{it.label}</p>
          {it.q && <p className="text-lg font-semibold text-slate-800">{it.q}</p>}
          {it.q && it.a && !shown && (
            <button type="button" onClick={() => setShown(true)} className={btnBrand}>
              Δες την απάντηση
            </button>
          )}
          {shown && <Feedback kind="good">{it.a}</Feedback>}
          <div>
            <button type="button" onClick={next} className={btnPrimary}>
              Συνέχεια
            </button>
          </div>
        </div>
      )}
      <div>
        <button type="button" onClick={() => onFinish(0, 0, `Γύρισες τον τροχό ${count} φορές.`)} className={btnGhost}>
          Τέλος παιχνιδιού
        </button>
      </div>
    </div>
  );
}

/* ---------- Μνήμη ---------- */
type MemCard = { id: number; pair: number; t: string };

export function MemoryPlayer({ data, onFinish }: { data: MemoryData; onFinish: FinishFn }) {
  const cards = useMemo<MemCard[]>(
    () =>
      shuffle(memPairs(data.text).flatMap((p, i) => [{ pair: i, t: p[0] }, { pair: i, t: p[1] }])).map((c, id) => ({ ...c, id })),
    [data]
  );
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);

  const flip = (c: MemCard) => {
    if (lock.current || open.includes(c.id) || matched.includes(c.pair)) return;
    const o = [...open, c.id];
    setOpen(o);
    if (o.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = o.map((id) => cards[id]);
    lock.current = true;
    setTimeout(() => {
      if (a.pair === b.pair) {
        const m = [...matched, a.pair];
        setMatched(m);
        if (m.length * 2 === cards.length) onFinish(0, 0, `Βρήκες όλα τα ζευγάρια σε ${moves + 1} κινήσεις.`);
      }
      setOpen([]);
      lock.current = false;
    }, 800);
  };

  if (cards.length < 4) return <p className="text-slate-500">Χρειάζονται τουλάχιστον δύο ζευγάρια.</p>;
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-slate-500">Κινήσεις: {moves}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {cards.map((c) => {
          const up = open.includes(c.id) || matched.includes(c.pair);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(c)}
              aria-label={up ? c.t : "κλειστή κάρτα"}
              className={`h-20 rounded-xl border-2 font-bold p-1 transition ${
                matched.includes(c.pair)
                  ? "border-green-500 bg-green-50 text-green-800"
                  : up
                    ? "border-sky-500 bg-white text-slate-800"
                    : "border-sky-600 bg-sky-500 text-white text-2xl"
              }`}
            >
              {up ? c.t : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
