"use client";

import type { ReactNode } from "react";
import type {
  CrosswordData,
  FillData,
  MathData,
  McData,
  MemoryData,
  OpenData,
  WheelData,
} from "@/lib/activities/types";
import { btnGhost, inputCls } from "@/components/activities/ui";
import { crossEntries, memPairs, openItems, parseFill, wheelItems } from "@/lib/activities/parse";
import { genCross } from "@/lib/activities/crossword";

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5" />
      {label}
    </label>
  );
}

function Help({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-slate-700">{children}</p>;
}

function TextBox({
  value,
  onChange,
  rows = 8,
  label,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  label: string;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      aria-label={label}
      placeholder={placeholder}
      className={`${inputCls} font-mono text-sm`}
    />
  );
}

export function McEditor({ data, onChange }: { data: McData; onChange: (d: McData) => void }) {
  const set = (qs: McData["questions"]) => onChange({ ...data, questions: qs });
  const upd = (i: number, patch: Partial<McData["questions"][number]>) =>
    set(data.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)));
  return (
    <div className="space-y-4">
      <Help>Σημείωσε ✓ στη σωστή απάντηση (ή σε περισσότερες). Η εξήγηση φαίνεται στο παιδί μετά την απάντηση.</Help>
      {data.questions.map((q, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between">
            <b className="text-slate-700">Ερώτηση {i + 1}</b>
            {data.questions.length > 1 && (
              <button type="button" onClick={() => set(data.questions.filter((_, k) => k !== i))} className={`${btnGhost} !py-1 text-sm`}>
                Αφαίρεση
              </button>
            )}
          </div>
          <input
            type="text"
            value={q.q}
            aria-label="Ερώτηση"
            placeholder="Γράψε την ερώτηση"
            onChange={(e) => upd(i, { q: e.target.value })}
            className={inputCls}
          />
          {q.options.map((o, j) => (
            <div key={j} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={o.ok}
                aria-label="Σωστή"
                onChange={(e) => upd(i, { options: q.options.map((x, k) => (k === j ? { ...x, ok: e.target.checked } : x)) })}
                className="w-5 h-5"
              />
              <input
                type="text"
                value={o.t}
                aria-label={`Επιλογή ${j + 1}`}
                placeholder={`Επιλογή ${j + 1}`}
                onChange={(e) => upd(i, { options: q.options.map((x, k) => (k === j ? { ...x, t: e.target.value } : x)) })}
                className={inputCls}
              />
              {q.options.length > 2 && (
                <button
                  type="button"
                  aria-label="Αφαίρεση επιλογής"
                  onClick={() => upd(i, { options: q.options.filter((_, k) => k !== j) })}
                  className="text-red-500 font-bold px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <input
            type="text"
            value={q.why ?? ""}
            aria-label="Εξήγηση"
            placeholder="Εξήγηση που θα δει το παιδί μετά την απάντηση (προαιρετικά)"
            onChange={(e) => upd(i, { why: e.target.value })}
            className={inputCls}
          />
          {q.options.length < 6 && (
            <button type="button" onClick={() => upd(i, { options: [...q.options, { t: "", ok: false }] })} className={`${btnGhost} !py-1 text-sm`}>
              + Επιλογή
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => set([...data.questions, { q: "", why: "", options: [{ t: "", ok: true }, { t: "", ok: false }, { t: "", ok: false }] }])}
        className={btnGhost}
      >
        + Νέα ερώτηση
      </button>
      <div className="space-y-1">
        <Check label="Ανακάτεμα ερωτήσεων" checked={!!data.shuffleQ} onChange={(v) => onChange({ ...data, shuffleQ: v })} />
        <Check label="Ανακάτεμα επιλογών" checked={!!data.shuffleO} onChange={(v) => onChange({ ...data, shuffleO: v })} />
        <Check label="Λειτουργία τεστ (μία προσπάθεια, φαίνεται η σωστή απάντηση)" checked={!!data.test} onChange={(v) => onChange({ ...data, test: v })} />
      </div>
    </div>
  );
}

export function FillEditor({ data, onChange }: { data: FillData; onChange: (d: FillData) => void }) {
  return (
    <div className="space-y-3">
      <Help>
        Μία πρόταση ανά γραμμή. Βάλε τη λέξη που λείπει σε [αγκύλες], π.χ. <b>Η [γάτα] τρώει ψάρι.</b> Για
        εναλλακτικές απαντήσεις χρησιμοποίησε |, π.χ. [μπάλα|μπάλλα].
      </Help>
      <TextBox label="Προτάσεις" value={data.text} onChange={(text) => onChange({ ...data, text })} />
      <Check label="Τράπεζα λέξεων (πάτημα αντί για γράψιμο)" checked={!!data.bank} onChange={(v) => onChange({ ...data, bank: v })} />
      <Check label="Ανακάτεμα προτάσεων" checked={!!data.shuffle} onChange={(v) => onChange({ ...data, shuffle: v })} />
      <Check label="Λειτουργία τεστ (μία προσπάθεια, φαίνεται η σωστή απάντηση)" checked={!!data.test} onChange={(v) => onChange({ ...data, test: v })} />
    </div>
  );
}

export function OpenEditor({ data, onChange }: { data: OpenData; onChange: (d: OpenData) => void }) {
  return (
    <div className="space-y-3">
      <Help>
        Μία ερώτηση ανά γραμμή, με τη μορφή <b>ερώτηση | σωστή απάντηση | λέξη1, λέξη2</b>. Οι λέξεις-κλειδιά είναι
        προαιρετικές και δείχνουν στο παιδί πόσες βρήκε.
      </Help>
      <TextBox label="Ερωτήσεις" value={data.text} onChange={(text) => onChange({ text })} />
    </div>
  );
}

export function CrossEditor({ data, onChange }: { data: CrosswordData; onChange: (d: CrosswordData) => void }) {
  const entries = crossEntries(data.text);
  const cw = entries.length >= 2 ? genCross(entries) : null;
  return (
    <div className="space-y-3">
      <Help>
        Μία λέξη ανά γραμμή, με τη μορφή <b>λέξη | υπόδειξη</b>. Το πλέγμα φτιάχνεται αυτόματα. Οι τόνοι δεν
        μετράνε.
      </Help>
      <TextBox label="Λέξεις" value={data.text} onChange={(text) => onChange({ text })} />
      {cw && cw.unplaced.length > 0 && (
        <p className="text-sm text-amber-700">Αυτές οι λέξεις δεν χωρούν: {cw.unplaced.map((e) => e.raw).join(", ")}</p>
      )}
      {cw && cw.unplaced.length === 0 && <p className="text-sm text-green-700">Χώρεσαν και οι {cw.words.length} λέξεις.</p>}
    </div>
  );
}

export function WheelEditor({ data, onChange }: { data: WheelData; onChange: (d: WheelData) => void }) {
  return (
    <div className="space-y-3">
      <Help>
        Ένα στοιχείο ανά γραμμή: <b>όνομα | ερώτηση | απάντηση</b>. Η ερώτηση και η απάντηση είναι προαιρετικές.
      </Help>
      <TextBox label="Στοιχεία τροχού" value={data.text} onChange={(text) => onChange({ ...data, text })} />
      <Check label="Κάθε στοιχείο να βγαίνει μία φορά" checked={!!data.remove} onChange={(v) => onChange({ ...data, remove: v })} />
    </div>
  );
}

export function MemoryEditor({ data, onChange }: { data: MemoryData; onChange: (d: MemoryData) => void }) {
  return (
    <div className="space-y-3">
      <Help>Ένα ζευγάρι ανά γραμμή: <b>πρώτο | δεύτερο</b> (π.χ. 3 + 4 | 7). Μέχρι 12 ζευγάρια.</Help>
      <TextBox label="Ζευγάρια" value={data.text} onChange={(text) => onChange({ text })} />
    </div>
  );
}

const OPS = ["+", "−", "×", "÷"];
export function MathEditor({ data, onChange }: { data: MathData; onChange: (d: MathData) => void }) {
  const num = (k: "min" | "max" | "count" | "table", label: string) => (
    <label className="text-sm text-slate-600">
      {label}
      <input
        type="number"
        value={data[k]}
        onChange={(e) => onChange({ ...data, [k]: e.target.value === "" ? "" : Number(e.target.value) })}
        className={inputCls}
      />
    </label>
  );
  return (
    <div className="space-y-3">
      <Help>Οι πράξεις παράγονται τυχαία. Διάλεξε πράξεις, εύρος αριθμών και πόσες ερωτήσεις θέλεις.</Help>
      <div className="flex flex-wrap gap-4">
        {OPS.map((o) => (
          <Check
            key={o}
            label={o}
            checked={data.ops.includes(o)}
            onChange={(v) => onChange({ ...data, ops: v ? [...data.ops, o] : data.ops.filter((x) => x !== o) })}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {num("min", "Από")}
        {num("max", "Μέχρι")}
        {num("count", "Πλήθος")}
        {num("table", "Προπαίδεια του (προαιρετικό)")}
      </div>
      <Check label="Κρυμμένος αριθμός (π.χ. 7 + ? = 12)" checked={!!data.gap} onChange={(v) => onChange({ ...data, gap: v })} />
      <Check label="Λειτουργία τεστ (μία προσπάθεια, φαίνεται η σωστή απάντηση)" checked={!!data.test} onChange={(v) => onChange({ ...data, test: v })} />
    </div>
  );
}

/** Έλεγχοι πριν την αποθήκευση: επιστρέφουν μήνυμα ή null. */
export function validate(type: string, d: Record<string, unknown>): string | null {
  switch (type) {
    case "mc": {
      const qs = (d as unknown as McData).questions ?? [];
      const ok = qs.filter((q) => q.q.trim() && q.options.filter((o) => o.t.trim()).length >= 2 && q.options.some((o) => o.ok && o.t.trim()));
      return ok.length ? null : "Χρειάζεται τουλάχιστον μία ερώτηση με δύο επιλογές και μία σωστή.";
    }
    case "fill":
      return parseFill(String(d.text ?? "")).length ? null : "Βάλε τουλάχιστον μία πρόταση με λέξη σε [αγκύλες].";
    case "open":
      return openItems(String(d.text ?? "")).length ? null : "Γράψε τουλάχιστον μία ερώτηση.";
    case "crossword":
      return crossEntries(String(d.text ?? "")).length >= 2 ? null : "Χρειάζονται τουλάχιστον δύο λέξεις.";
    case "wheel":
      return wheelItems(String(d.text ?? "")).length >= 2 ? null : "Χρειάζονται τουλάχιστον δύο στοιχεία.";
    case "memory":
      return memPairs(String(d.text ?? "")).length >= 2 ? null : "Χρειάζονται τουλάχιστον δύο ζευγάρια.";
    case "math":
      return ((d as unknown as MathData).ops ?? []).length ? null : "Διάλεξε τουλάχιστον μία πράξη.";
    default:
      return "Άγνωστος τύπος.";
  }
}
