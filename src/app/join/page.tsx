"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, inputCls } from "@/components/activities/ui";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const c = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length < 4) return setError("Γράψε τον κωδικό της τάξης σου.");
    router.push(`/class/${c}`);
  }

  return (
    <main className="min-h-screen grid place-items-center p-4 bg-sky-50">
      <form onSubmit={go} className="bg-white rounded-3xl shadow p-8 w-full max-w-md space-y-4 text-center">
        <div className="text-5xl">🎮</div>
        <h1 className="font-heading text-3xl font-extrabold text-sky-700">Μπες στην τάξη</h1>
        <p className="text-slate-600">Γράψε τον κωδικό που σου έδωσε ο δάσκαλος ή η δασκάλα σου.</p>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          maxLength={10}
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          aria-label="Κωδικός τάξης"
          placeholder="π.χ. K7M2QX"
          className={`${inputCls} text-center text-2xl font-extrabold tracking-widest`}
        />
        {error && <p role="alert" className="text-red-600 font-medium">{error}</p>}
        <button type="submit" className={`${btnPrimary} w-full`}>
          Πάμε!
        </button>
      </form>
    </main>
  );
}
