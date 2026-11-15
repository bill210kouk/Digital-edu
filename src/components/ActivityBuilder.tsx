"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GRADE_LABELS, SUBJECT_LABELS } from "@/lib/constants";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_KEYS, type ActivityType } from "@/lib/activityTypes";
import { REGISTRY } from "@/components/activities/registry";
import { validate } from "@/components/activities/editors";
import Runner from "@/components/activities/Runner";
import { btnBrand, btnGhost, btnPrimary, inputCls } from "@/components/activities/ui";

type SubjectOption = { id: string; name: string; type: string; grade: string };
type Initial = {
  id: string;
  title: string;
  type: string;
  tag: string;
  data: unknown;
  subjectId: string | null;
};

export default function ActivityBuilder({
  subjects,
  initial,
  initialSubjectId,
}: {
  subjects: SubjectOption[];
  initial: Initial | null;
  initialSubjectId: string | null;
}) {
  const router = useRouter();
  const [type, setType] = useState<ActivityType | null>(
    initial && initial.type in REGISTRY ? (initial.type as ActivityType) : null
  );
  const [data, setData] = useState<Record<string, unknown>>(
    (initial?.data as Record<string, unknown>) ?? {}
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? initialSubjectId ?? "");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function choose(t: ActivityType) {
    setType(t);
    setData(REGISTRY[t].blank());
    setTitle("");
  }

  async function save() {
    if (!type) return;
    setError("");
    if (!title.trim()) return setError("Γράψε έναν τίτλο.");
    const problem = validate(type, data);
    if (problem) return setError(problem);
    setSaving(true);
    try {
      const res = await fetch(initial ? `/api/activities/${initial.id}` : "/api/activities", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tag, type, data, subjectId: subjectId || null }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Η αποθήκευση απέτυχε. Δοκίμασε ξανά.");
        return;
      }
      router.push("/dashboard/activities");
      router.refresh();
    } catch {
      setError("Δεν υπάρχει σύνδεση. Δοκίμασε ξανά.");
    } finally {
      setSaving(false);
    }
  }

  const def = type ? REGISTRY[type] : null;
  const Editor = def?.Editor as React.ComponentType<{
    data: Record<string, unknown>;
    onChange: (d: Record<string, unknown>) => void;
  }> | undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <Link href="/dashboard/activities" className="text-sky-700 font-medium hover:underline">
          ← Πίσω στις δραστηριότητες
        </Link>
        <h1 className="font-heading text-2xl font-extrabold text-sky-700 mt-1">
          {initial ? "Επεξεργασία δραστηριότητας" : "Νέα δραστηριότητα"}
        </h1>
      </div>

      {!type && (
        <div className="grid sm:grid-cols-2 gap-4">
          {ACTIVITY_TYPE_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => choose(k)}
              className="text-left bg-white rounded-2xl shadow p-5 hover:ring-2 hover:ring-sky-400 transition"
            >
              <div className="text-3xl">{ACTIVITY_TYPES[k].emoji}</div>
              <h2 className="font-heading font-bold text-lg text-slate-700">{ACTIVITY_TYPES[k].label}</h2>
              <p className="text-sm text-slate-500">{REGISTRY[k].blurb}</p>
            </button>
          ))}
        </div>
      )}

      {type && Editor && (
        <div className="bg-white rounded-3xl shadow p-5 space-y-5">
          <p className="font-heading font-bold text-slate-700">
            {ACTIVITY_TYPES[type].emoji} {ACTIVITY_TYPES[type].label}
            {!initial && (
              <button type="button" onClick={() => setType(null)} className="ml-3 text-sm font-medium text-sky-700 hover:underline">
                Άλλος τύπος
              </button>
            )}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm text-slate-600">
              Τίτλος
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputCls} />
            </label>
            <label className="text-sm text-slate-600">
              Ετικέτα (προαιρετικά)
              <input value={tag} onChange={(e) => setTag(e.target.value)} maxLength={120} placeholder="π.χ. Ενότητα 3" className={inputCls} />
            </label>
          </div>
          <label className="block text-sm text-slate-600">
            Μάθημα
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputCls}>
              <option value="">Χωρίς μάθημα (για όλα)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {SUBJECT_LABELS[s.type]} {GRADE_LABELS[s.grade]}
                </option>
              ))}
            </select>
          </label>

          {preview ? (
            <div className="rounded-2xl border border-dashed border-sky-300 p-4">
              <p className="text-sm text-slate-500 mb-3">Δοκιμή (δεν αποθηκεύεται αποτέλεσμα)</p>
              {validate(type, data) ? (
                <p className="text-red-600">{validate(type, data)}</p>
              ) : (
                <Runner type={type} data={data} />
              )}
            </div>
          ) : (
            <Editor data={data} onChange={setData} />
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-medium">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPreview((p) => !p)} className={btnBrand}>
              {preview ? "← Πίσω στην επεξεργασία" : "Δοκιμή"}
            </button>
            <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
              {saving ? "Αποθήκευση..." : "Αποθήκευση"}
            </button>
            <Link href="/dashboard/activities" className={btnGhost}>
              Άκυρο
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
