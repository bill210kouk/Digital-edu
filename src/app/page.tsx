import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center bg-gradient-to-b from-sky-100 via-white to-amber-50">
      <div className="text-6xl mb-4">🎈📚🔢</div>
      <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-sky-700 mb-4">
        Μαθαίνω Παίζοντας
      </h1>
      <p className="max-w-xl text-lg text-slate-600 mb-8">
        Ο ψηφιακός βοηθός με παιχνίδια για τις πρώτες τάξεις του Δημοτικού. Γλώσσα,
        Μαθηματικά και Αγγλικά μέσα από διασκεδαστικά παιχνίδια, φτιαγμένα για να
        βοηθήσουν τα παιδιά να μάθουν και να καταλάβουν καλύτερα.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        {session ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-sky-600 text-white px-8 py-3 font-semibold text-lg shadow-lg hover:bg-sky-700 transition"
          >
            Πήγαινε στον Πίνακα Ελέγχου 🚀
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full bg-sky-600 text-white px-8 py-3 font-semibold text-lg shadow-lg hover:bg-sky-700 transition"
            >
              Σύνδεση Εκπαιδευτικού
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white text-sky-700 px-8 py-3 font-semibold text-lg shadow-lg border-2 border-sky-600 hover:bg-sky-50 transition"
            >
              Δημιουργία Λογαριασμού
            </Link>
          </>
        )}
      </div>
      <Link href="/join" className="mt-6 text-sky-700 font-semibold hover:underline">
        Είμαι μαθητής, έχω κωδικό τάξης 🎮
      </Link>

      <div className="grid sm:grid-cols-3 gap-6 mt-16 max-w-4xl">
        {[
          { emoji: "📖", title: "Γλώσσα", text: "Λέξεις, γράμματα και ανάγνωση με παιχνίδια." },
          { emoji: "🔢", title: "Μαθηματικά", text: "Αριθμοί, πράξεις και σχήματα παιχνιδιάρικα." },
          { emoji: "🇬🇧", title: "Αγγλικά", text: "Πρώτες αγγλικές λέξεις με εικόνες και παιχνίδια." },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl bg-white shadow p-6">
            <div className="text-4xl mb-2">{s.emoji}</div>
            <h3 className="font-heading font-bold text-xl text-slate-700">{s.title}</h3>
            <p className="text-slate-500 mt-1">{s.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
