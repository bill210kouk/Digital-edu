import Link from "next/link";
import { getClassByCode } from "@/lib/classAccess";
import { activityTypeInfo } from "@/lib/activityTypes";
import StudentPicker from "@/components/StudentPicker";

export const dynamic = "force-dynamic";

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { code } = await params;
  const { studentId } = await searchParams;
  const cls = await getClassByCode(code);

  if (!cls) {
    return (
      <main className="min-h-screen grid place-items-center p-4 bg-sky-50">
        <div className="bg-white rounded-3xl shadow p-8 max-w-md text-center space-y-3">
          <div className="text-5xl">🤔</div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-700">Δεν βρήκα αυτόν τον κωδικό</h1>
          <p className="text-slate-600">Έλεγξε ότι τον έγραψες σωστά.</p>
          <Link href="/join" className="inline-block rounded-full bg-amber-400 text-amber-900 px-5 py-2 font-bold">
            Δοκίμασε ξανά
          </Link>
        </div>
      </main>
    );
  }

  const student = cls.subject.students.find((s) => s.id === studentId) ?? null;
  return (
    <main className="min-h-screen bg-sky-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="text-center pt-4">
          <h1 className="font-heading text-3xl font-extrabold text-sky-700">{cls.subject.name}</h1>
          <p className="text-slate-500">Κωδικός τάξης: {cls.code}</p>
        </header>

        {!student ? (
          <StudentPicker code={cls.code} students={cls.subject.students} />
        ) : (
          <>
            <p className="text-center font-heading font-bold text-slate-700">
              Γεια σου, {student.name}! 👋{" "}
              <Link href={`/class/${cls.code}`} className="text-sm font-medium text-sky-700 hover:underline">
                (δεν είμαι εγώ)
              </Link>
            </p>
            {cls.activities.length === 0 ? (
              <p className="text-center text-slate-500">Δεν υπάρχουν ακόμα παιχνίδια. Ρώτα τον δάσκαλο ή τη δασκάλα σου.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {cls.activities.map((a) => {
                  const info = activityTypeInfo(a.type);
                  return (
                    <Link
                      key={a.id}
                      href={`/class/${cls.code}/play/${a.id}?studentId=${student.id}`}
                      className="bg-white rounded-2xl shadow p-5 hover:ring-2 hover:ring-amber-400 transition"
                    >
                      <div className="text-3xl">{info.emoji}</div>
                      <h2 className="font-heading font-bold text-lg text-slate-700">{a.title}</h2>
                      <p className="text-sm text-slate-500">
                        {info.label}
                        {a.tag ? ` · ${a.tag}` : ""}
                      </p>
                      <span className="mt-3 inline-block rounded-full bg-amber-400 text-amber-900 px-4 py-1.5 font-bold">
                        Παίξε! 🎮
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
