"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GRADE_LABELS, SUBJECT_LABELS } from "@/lib/constants";
import ActivityFrame, { type FrameActivity, type FrameMessage } from "@/components/ActivityFrame";

type SubjectOption = { id: string; name: string; type: string; grade: string };

export default function ActivityBuilder({
  subjects,
  initial,
  initialSubjectId,
}: {
  subjects: SubjectOption[];
  initial: (FrameActivity & { subjectId: string | null }) | null;
  initialSubjectId: string | null;
}) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState<string>(initial?.subjectId ?? initialSubjectId ?? "");
  const subjectRef = useRef(subjectId);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function changeSubject(value: string) {
    setSubjectId(value);
    subjectRef.current = value;
  }

  async function handleMessage(m: FrameMessage) {
    if (m.type === "cancel") {
      router.push("/dashboard/activities");
      return;
    }
    if (m.type !== "save" || !m.activity) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch(initial ? `/api/activities/${initial.id}` : "/api/activities", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: m.activity.title,
          tag: m.activity.tag ?? "",
          type: m.activity.type,
          data: m.activity.data,
          subjectId: subjectRef.current || null,
        }),
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/activities" className="text-sky-700 font-medium hover:underline">
            ← Πίσω στις δραστηριότητες
          </Link>
          <h1 className="font-heading text-2xl font-extrabold text-sky-700 mt-1">
            {initial ? "Επεξεργασία δραστηριότητας" : "Νέα δραστηριότητα"}
          </h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Μάθημα
          <select
            value={subjectId}
            onChange={(e) => changeSubject(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">Χωρίς μάθημα (για όλα)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {SUBJECT_LABELS[s.type]} {GRADE_LABELS[s.grade]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-medium">
          {error}
        </p>
      )}
      {saving && <p className="text-slate-500 text-sm">Αποθήκευση στη βάση...</p>}

      <ActivityFrame mode="builder" activity={initial} onMessage={handleMessage} />
    </div>
  );
}
