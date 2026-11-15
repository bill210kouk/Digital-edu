"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { activityTypeInfo } from "@/lib/activityTypes";

type Student = { id: string; name: string };
type SubjectOption = { id: string; name: string; students: Student[] };
type Item = { id: string; title: string; type: string; tag: string; subjectId: string | null };

export default function ActivitiesBoard({
  activities,
  subjects,
}: {
  activities: Item[];
  subjects: SubjectOption[];
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<Record<string, string>>({});

  async function remove(id: string) {
    if (!confirm("Να διαγραφεί η δραστηριότητα;")) return;
    const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-sky-700">✨ Οι δραστηριότητές μου</h1>
          <p className="text-slate-500">Φτιάξε δικά σου τεστ, σταυρόλεξα και παιχνίδια για την τάξη σου.</p>
        </div>
        <Link
          href="/dashboard/activities/new"
          className="rounded-full bg-amber-400 text-amber-900 px-5 py-2.5 font-bold hover:bg-amber-300 transition"
        >
          + Νέα δραστηριότητα
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-slate-500">
          Δεν έχεις φτιάξει ακόμα δραστηριότητα. Πάτα «Νέα δραστηριότητα» για να ξεκινήσεις.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((a) => {
            const info = activityTypeInfo(a.type);
            const subject = subjects.find((s) => s.id === a.subjectId);
            const students = subject?.students ?? [];
            const studentId = picked[a.id] ?? students[0]?.id ?? "";
            return (
              <div key={a.id} className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2">
                <div className="text-3xl">{info.emoji}</div>
                <h3 className="font-heading font-bold text-lg text-slate-700">{a.title}</h3>
                <p className="text-sm text-slate-500">
                  {info.label}
                  {a.tag ? ` · ${a.tag}` : ""}
                </p>
                <p className="text-sm text-slate-400 flex-1">
                  {subject ? `Μάθημα: ${subject.name}` : "Δεν συνδέεται με μάθημα"}
                </p>

                {students.length > 0 && (
                  <select
                    value={studentId}
                    onChange={(e) => setPicked((p) => ({ ...p, [a.id]: e.target.value }))}
                    aria-label="Μαθητής"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex flex-wrap gap-2 mt-1">
                  {studentId ? (
                    <Link
                      href={`/dashboard/activities/${a.id}/play?studentId=${studentId}`}
                      className="rounded-full bg-amber-400 text-amber-900 px-4 py-1.5 font-bold hover:bg-amber-300 transition"
                    >
                      Παίξε με μαθητή 🎮
                    </Link>
                  ) : null}
                  <Link
                    href={`/dashboard/activities/${a.id}/play`}
                    className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Δοκιμή
                  </Link>
                  <Link
                    href={`/dashboard/activities/${a.id}/edit`}
                    className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Επεξεργασία
                  </Link>
                  <button
                    onClick={() => remove(a.id)}
                    className="rounded-full border border-red-200 text-red-600 px-4 py-1.5 text-sm font-medium hover:bg-red-50 transition"
                  >
                    Διαγραφή
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
