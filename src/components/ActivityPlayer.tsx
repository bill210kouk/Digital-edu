"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACTIVITY_GAME_PREFIX, activityTypeInfo } from "@/lib/activityTypes";
import type { ActivityType } from "@/lib/activityTypes";
import Runner, { type Outcome } from "@/components/activities/Runner";
import { btnGhost } from "@/components/activities/ui";

type FrameActivity = { id: string; title: string; type: string; tag: string; data: unknown };

export default function ActivityPlayer({
  activity,
  subjectId,
  studentId,
  studentName,
  backHref,
  joinCode,
}: {
  activity: FrameActivity;
  subjectId: string | null;
  studentId: string | null;
  studentName: string | null;
  backHref: string;
  joinCode?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<{ kind: "ok" | "info" | "error"; text: string } | null>(null);
  const info = activityTypeInfo(activity.type);
  const canSave = Boolean(subjectId && studentId);

  async function handleFinish(m: Outcome) {
    if (!canSave) {
      setStatus({ kind: "info", text: "Δοκιμαστικό παιχνίδι: το αποτέλεσμα δεν αποθηκεύεται." });
      return;
    }
    // Δραστηριότητες χωρίς βαθμολογία (σταυρόλεξο, μνήμη) καταγράφονται ως «ολοκληρώθηκε».
    const scored = m.total > 0;
    setStatus({ kind: "info", text: "Αποθήκευση αποτελέσματος..." });
    try {
      const res = joinCode
        ? await fetch(`/api/join/${joinCode}/results`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId,
              activityId: activity.id,
              score: scored ? m.score : 1,
              maxScore: scored ? m.total : 1,
              details: { review: m.review, note: m.note },
            }),
          })
        : await fetch(`/api/subjects/${subjectId}/results`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId,
              gameKey: `${ACTIVITY_GAME_PREFIX}${activity.id}`,
              gameLabel: activity.title,
              score: scored ? m.score : 1,
              maxScore: scored ? m.total : 1,
              details: { review: m.review, note: m.note },
            }),
          });
      setStatus(
        res.ok
          ? { kind: "ok", text: joinCode ? "Μπράβο! Το αποτέλεσμά σου στάλθηκε στον δάσκαλο." : `Το αποτέλεσμα του μαθητή ${studentName} αποθηκεύτηκε.` }
          : { kind: "error", text: "Το αποτέλεσμα δεν αποθηκεύτηκε. Δοκίμασε ξανά." }
      );
    } catch {
      setStatus({ kind: "error", text: "Δεν υπάρχει σύνδεση. Το αποτέλεσμα δεν αποθηκεύτηκε." });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link href={backHref} className="text-sky-700 font-medium hover:underline">
          ← Πίσω
        </Link>
        {studentName && <span className="font-heading font-bold text-slate-600">🧒 {studentName}</span>}
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-center text-sky-700">
        {info.emoji} {activity.title}
      </h1>
      {status && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 font-medium text-center ${
            status.kind === "ok"
              ? "bg-green-50 text-green-700"
              : status.kind === "error"
                ? "bg-red-50 text-red-600"
                : "bg-sky-50 text-slate-600"
          }`}
        >
          {status.text}
        </p>
      )}
      <div className="bg-white rounded-3xl shadow p-5 sm:p-8">
        <Runner
          type={activity.type as ActivityType}
          data={activity.data as Record<string, unknown>}
          onFinish={handleFinish}
          extra={
            <button type="button" onClick={() => router.push(backHref)} className={btnGhost}>
              Τέλος
            </button>
          }
        />
      </div>
    </div>
  );
}
