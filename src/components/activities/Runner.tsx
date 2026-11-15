"use client";

import { useState, type ReactNode } from "react";
import type { ActivityType } from "@/lib/activityTypes";
import type { Review } from "@/lib/activities/types";
import { REGISTRY } from "@/components/activities/registry";
import { ResultScreen } from "@/components/activities/ui";

export type Outcome = { score: number; total: number; note: string; review: Review[] };

/** Παίζει μια δραστηριότητα και δείχνει το τελικό αποτέλεσμα. */
export default function Runner({
  type,
  data,
  onFinish,
  extra,
}: {
  type: ActivityType;
  data: Record<string, unknown>;
  onFinish?: (o: Outcome) => void;
  extra?: ReactNode;
}) {
  const [round, setRound] = useState(0);
  const [out, setOut] = useState<Outcome | null>(null);
  const def = REGISTRY[type];
  if (!def) return <p className="text-red-600">Άγνωστος τύπος δραστηριότητας.</p>;

  if (out) {
    return (
      <ResultScreen
        {...out}
        onAgain={() => {
          setOut(null);
          setRound((r) => r + 1);
        }}
        extra={extra}
      />
    );
  }
  const Player = def.Player as React.ComponentType<{
    data: Record<string, unknown>;
    onFinish: (s: number, t: number, n?: string, r?: Review[]) => void;
  }>;
  return (
    <Player
      key={round}
      data={data}
      onFinish={(score, total, note = "", review = []) => {
        const o = { score, total, note, review };
        setOut(o);
        onFinish?.(o);
        window.scrollTo?.({ top: 0 });
      }}
    />
  );
}
