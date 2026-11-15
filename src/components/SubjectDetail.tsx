"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GRADE_LABELS,
  GRADE_LEVEL,
  SUBJECT_EMOJI,
  SUBJECT_GAMES,
  SUBJECT_LABELS,
  UNIT_GAME_TYPES,
} from "@/lib/constants";
import { vocabUnitsForGrade } from "@/lib/gameData";

type Student = { id: string; name: string };
type Note = { id: string; title: string; content: string; createdAt: string | Date };
type Result = {
  id: string;
  gameKey: string;
  score: number;
  maxScore: number;
  createdAt: string | Date;
  student: Student;
};
type Subject = {
  id: string;
  name: string;
  type: string;
  grade: string;
  students: Student[];
  notes: Note[];
};

const TABS = ["students", "games", "notes", "results"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  students: "👧🧒 Μαθητές",
  games: "🎮 Παιχνίδια",
  notes: "📝 Σημειώσεις",
  results: "🏆 Αποτελέσματα",
};

export default function SubjectDetail({
  subject,
  results,
}: {
  subject: Subject;
  results: Result[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("students");
  const [students, setStudents] = useState(subject.students);
  const [notes, setNotes] = useState(subject.notes);

  const [studentName, setStudentName] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>(students[0]?.id ?? "");

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName.trim()) return;
    const res = await fetch(`/api/subjects/${subject.id}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: studentName }),
    });
    const data = await res.json();
    if (res.ok) {
      setStudents((prev) => [...prev, data.student]);
      setSelectedStudent((prev) => prev || data.student.id);
      setStudentName("");
      router.refresh();
    }
  }

  async function removeStudent(id: string) {
    if (!confirm("Να διαγραφεί ο μαθητής;")) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const res = await fetch(`/api/subjects/${subject.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: noteTitle, content: noteContent }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotes((prev) => [data.note, ...prev]);
      setNoteTitle("");
      setNoteContent("");
      router.refresh();
    }
  }

  async function removeNote(id: string) {
    if (!confirm("Να διαγραφεί η σημείωση;")) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const games = SUBJECT_GAMES[subject.type] ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sky-600 text-sm hover:underline">
          ← Πίσω στα μαθήματα
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <div className="text-4xl">{SUBJECT_EMOJI[subject.type]}</div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-700">{subject.name}</h1>
            <p className="text-slate-500 text-sm">
              {SUBJECT_LABELS[subject.type]} · {GRADE_LABELS[subject.grade]}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
              tab === t ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-sky-100"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "students" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <form onSubmit={addStudent} className="flex gap-3 mb-6">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Όνομα μαθητή/τριας"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              className="rounded-full bg-sky-600 text-white px-5 py-2 font-semibold hover:bg-sky-700 transition"
            >
              + Προσθήκη
            </button>
          </form>
          {students.length === 0 ? (
            <p className="text-slate-500">Δεν υπάρχουν ακόμα μαθητές σε αυτό το μάθημα.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {students.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between bg-sky-50 rounded-xl px-4 py-2.5"
                >
                  <span className="font-medium text-slate-700">🧒 {s.name}</span>
                  <button
                    onClick={() => removeStudent(s.id)}
                    className="text-slate-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "games" && (
        <div>
          <div className="bg-white rounded-2xl shadow p-5 mb-5 flex flex-wrap items-center gap-3">
            <label className="font-medium text-slate-600">Μαθητής που παίζει:</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
              disabled={students.length === 0}
            >
              {students.length === 0 && <option>Πρόσθεσε πρώτα μαθητή</option>}
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {games.map((g) => (
              <div key={g.key} className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2">
                <div className="text-3xl">{g.emoji}</div>
                <h3 className="font-heading font-bold text-lg text-slate-700">{g.title}</h3>
                <p className="text-sm text-slate-500 flex-1">{g.description}</p>
                {selectedStudent ? (
                  <Link
                    href={`/play/${subject.id}/${g.key}?studentId=${selectedStudent}`}
                    className="mt-2 inline-block text-center rounded-full bg-amber-400 text-amber-900 px-4 py-2 font-bold hover:bg-amber-300 transition"
                  >
                    Παίξε! 🎮
                  </Link>
                ) : (
                  <span className="mt-2 inline-block text-center rounded-full bg-slate-100 text-slate-400 px-4 py-2 font-bold">
                    Επίλεξε μαθητή
                  </span>
                )}
              </div>
            ))}
          </div>

          {subject.type === "GLOSSA" && (
            <div className="mt-10">
              <h3 className="font-heading text-xl font-bold text-slate-700 mb-1">
                📚 Ενότητες Λεξιλογίου
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Μικρές θεματικές ενότητες με 4 παιχνίδια η καθεμία — ιδανικό για εξάσκηση λίγων
                λέξεων τη φορά.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {vocabUnitsForGrade(GRADE_LEVEL[subject.grade]).map((unit) => (
                  <div key={unit.id} className="bg-white rounded-2xl shadow p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{unit.emoji}</span>
                      <h4 className="font-heading font-bold text-slate-700">{unit.title}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {UNIT_GAME_TYPES.map((g) => {
                        const key = `unit-${unit.id}-${g.type}`;
                        return selectedStudent ? (
                          <Link
                            key={g.type}
                            href={`/play/${subject.id}/${key}?studentId=${selectedStudent}`}
                            className="text-center rounded-xl bg-sky-50 text-sky-700 px-3 py-2 text-sm font-semibold hover:bg-sky-100 transition"
                          >
                            {g.emoji} {g.label}
                          </Link>
                        ) : (
                          <span
                            key={g.type}
                            className="text-center rounded-xl bg-slate-100 text-slate-400 px-3 py-2 text-sm font-semibold"
                          >
                            {g.emoji} {g.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <form onSubmit={addNote} className="space-y-3 mb-6">
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Τίτλος σημείωσης"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Περιεχόμενο μαθήματος / σημειώσεις..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              className="rounded-full bg-sky-600 text-white px-5 py-2 font-semibold hover:bg-sky-700 transition"
            >
              + Προσθήκη Σημείωσης
            </button>
          </form>
          {notes.length === 0 ? (
            <p className="text-slate-500">Δεν υπάρχουν ακόμα σημειώσεις.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="bg-sky-50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-700">{n.title}</h4>
                    <button
                      onClick={() => removeNote(n.id)}
                      className="text-slate-400 hover:text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-600 text-sm mt-1 whitespace-pre-wrap">{n.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "results" && (
        <div className="bg-white rounded-2xl shadow p-6">
          {results.length === 0 ? (
            <p className="text-slate-500">Δεν υπάρχουν ακόμα αποτελέσματα παιχνιδιών.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 border-b">
                  <th className="py-2">Μαθητής</th>
                  <th className="py-2">Παιχνίδι</th>
                  <th className="py-2">Σκορ</th>
                  <th className="py-2">Ημερομηνία</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const game = games.find((g) => g.key === r.gameKey);
                  return (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 font-medium text-slate-700">🧒 {r.student.name}</td>
                      <td className="py-2">
                        {game ? `${game.emoji} ${game.title}` : r.gameKey}
                      </td>
                      <td className="py-2">
                        {r.score} / {r.maxScore}
                      </td>
                      <td className="py-2 text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString("el-GR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
