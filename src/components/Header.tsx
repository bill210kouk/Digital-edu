"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header({ teacherName }: { teacherName: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="bg-white shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between">
      <Link href="/dashboard" className="font-heading text-xl font-extrabold text-sky-700">
        🎈 Μαθαίνω Παίζοντας
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/activities"
          className="rounded-full bg-amber-100 text-amber-800 px-4 py-1.5 text-sm font-bold hover:bg-amber-200 transition"
        >
          ✨ Δραστηριότητες
        </Link>
        <span className="text-slate-500 hidden sm:inline">Γεια σου, {teacherName} 👋</span>
        <button
          onClick={handleLogout}
          className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50 transition"
        >
          Αποσύνδεση
        </button>
      </div>
    </header>
  );
}
