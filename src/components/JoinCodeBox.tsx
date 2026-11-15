"use client";

import { useState } from "react";

export default function JoinCodeBox({ subjectId, initial }: { subjectId: string; initial: string }) {
  const [code, setCode] = useState(initial);
  const [msg, setMsg] = useState("");

  const link = () => `${window.location.origin}/class/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
      setMsg("Ο σύνδεσμος αντιγράφηκε.");
    } catch {
      setMsg(link());
    }
  }

  async function renew() {
    if (!confirm("Ο παλιός κωδικός θα πάψει να δουλεύει. Να φτιαχτεί νέος;")) return;
    const res = await fetch(`/api/subjects/${subjectId}/join-code`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setCode(body.joinCode);
      setMsg("Φτιάχτηκε νέος κωδικός.");
    } else setMsg(body.error ?? "Δεν έγινε. Δοκίμασε ξανά.");
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <span>Κωδικός τάξης για μαθητές:</span>
      <b className="rounded-lg bg-amber-100 px-3 py-1 text-lg tracking-widest text-amber-900">{code}</b>
      <button type="button" onClick={copy} className="rounded-full border border-slate-300 px-3 py-1 font-medium hover:bg-slate-50">
        Αντιγραφή συνδέσμου
      </button>
      <button type="button" onClick={renew} className="rounded-full border border-slate-300 px-3 py-1 font-medium hover:bg-slate-50">
        Νέος κωδικός
      </button>
      <span className="text-slate-400">Οι μαθητές μπαίνουν στο /join</span>
      {msg && <span role="status" className="text-sky-700">{msg}</span>}
    </div>
  );
}
