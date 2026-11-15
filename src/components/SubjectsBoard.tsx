"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GRADE_LABELS, SUBJECT_EMOJI, SUBJECT_LABELS } from "@/lib/constants";

type Subject = {
  id: string;
  name: string;
  type: string;
  grade: string;
  _count: { students: number };
};

export default function SubjectsBoard({ initialSubjects }: { initialSubjects: Subject[] }) {
  const router = useRouter();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("GLOSSA");
  const [grade, setGrade] = useState("A");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, grade }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Κάτι πήγε στραβά");
        return;
      }
      setSubjects((prev) => [{ ...data.subject, _count: { students: 0 } }, ...prev]);
      setName("");
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Να διαγραφεί το μάθημα; Θα διαγραφούν και οι μαθητές/σημειώσεις του.")) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-700">Τα Μαθήματά μου</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-sky-600 text-white px-5 py-2 font-semibold hover:bg-sky-700 transition"
        >
          + Νέο Μάθημα
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl shadow p-6 mb-8 grid sm:grid-cols-4 gap-4 items-end animate-pop"
        >
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Όνομα Μαθήματος
            </label>
            <input
              required
              placeholder="π.χ. Μαθηματικά Β1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Μάθημα</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {Object.entries(SUBJECT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Τάξη</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {Object.entries(GRADE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-600 text-sm sm:col-span-4">{error}</p>}
          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-sky-600 text-white px-6 py-2 font-semibold hover:bg-sky-700 transition disabled:opacity-60"
            >
              {loading ? "Δημιουργία..." : "Δημιουργία Μαθήματος"}
            </button>
          </div>
        </form>
      )}

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-slate-500">
          Δεν έχεις φτιάξει ακόμα κανένα μάθημα. Πάτησε &quot;+ Νέο Μάθημα&quot; για να ξεκινήσεις! 🚀
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 flex flex-col gap-2 animate-pop"
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">{SUBJECT_EMOJI[s.type]}</div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-slate-400 hover:text-red-500 text-sm"
                  title="Διαγραφή μαθήματος"
                >
                  ✕
                </button>
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-700">{s.name}</h3>
              <p className="text-sm text-slate-500">
                {SUBJECT_LABELS[s.type]} · {GRADE_LABELS[s.grade]}
              </p>
              <p className="text-sm text-slate-400">{s._count.students} μαθητές</p>
              <Link
                href={`/dashboard/subjects/${s.id}`}
                className="mt-2 inline-block rounded-full bg-sky-100 text-sky-700 text-center px-4 py-2 font-semibold hover:bg-sky-200 transition"
              >
                Άνοιγμα Μαθήματος
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
