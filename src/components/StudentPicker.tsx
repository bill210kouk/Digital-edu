"use client";

import Link from "next/link";

export default function StudentPicker({
  code,
  students,
}: {
  code: string;
  students: { id: string; name: string }[];
}) {
  if (students.length === 0) {
    return <p className="text-center text-slate-500">Ο δάσκαλος ή η δασκάλα δεν έχει προσθέσει ακόμα μαθητές.</p>;
  }
  return (
    <section className="bg-white rounded-3xl shadow p-6">
      <h2 className="font-heading text-xl font-bold text-slate-700 text-center mb-4">Ποιος είσαι;</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/class/${code}?studentId=${s.id}`}
            className="rounded-2xl border-2 border-sky-200 px-3 py-4 text-center font-bold text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition"
          >
            🧒 {s.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
