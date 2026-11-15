"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Κάτι πήγε στραβά");
        return;
      }
      router.push(params.get("next") ?? "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16 bg-sky-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="font-heading text-2xl font-bold text-sky-700 mb-1 text-center">
          Σύνδεση Εκπαιδευτικού
        </h1>
        <p className="text-center text-slate-500 mb-6">Καλωσήρθες πίσω! 👋</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Κωδικός</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-600 text-white py-2.5 font-semibold hover:bg-sky-700 transition disabled:opacity-60"
          >
            {loading ? "Σύνδεση..." : "Σύνδεση"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          Δεν έχεις λογαριασμό;{" "}
          <Link href="/register" className="text-sky-600 font-semibold hover:underline">
            Δημιουργία λογαριασμού
          </Link>
        </p>
      </div>
    </main>
  );
}
