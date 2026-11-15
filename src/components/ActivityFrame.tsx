"use client";

import { useEffect, useRef, useState } from "react";

export type FrameActivity = {
  id: string;
  title: string;
  type: string;
  tag: string;
  data: unknown;
};

export type FrameMessage = {
  src: "ergastiri";
  type: "ready" | "save" | "cancel" | "finish" | "exit";
  activity?: { title: string; tag: string; type: string; data: Record<string, unknown> };
  score?: number;
  total?: number;
  note?: string;
  review?: unknown[];
};

/**
 * Ενσωματώνει τον δημιουργό/αναπαραγωγέα δραστηριοτήτων (public/ergastiri/index.html)
 * σε iframe της ίδιας προέλευσης και επικοινωνεί μαζί του με postMessage.
 */
export default function ActivityFrame({
  mode,
  activity,
  onMessage,
}: {
  mode: "builder" | "play";
  activity: FrameActivity | null;
  onMessage: (m: FrameMessage) => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const handlerRef = useRef(onMessage);
  const activityRef = useRef(activity);

  useEffect(() => {
    handlerRef.current = onMessage;
    activityRef.current = activity;
  });

  // Ο listener μπαίνει πριν δημιουργηθεί το iframe, ώστε να μη χαθεί το μήνυμα "ready".
  useEffect(() => {
    function onWindowMessage(e: MessageEvent) {
      const frame = frameRef.current;
      if (!frame || e.origin !== window.location.origin || e.source !== frame.contentWindow) return;
      const m = e.data as FrameMessage | null;
      if (!m || m.src !== "ergastiri") return;
      if (m.type === "ready") {
        frame.contentWindow?.postMessage(
          { src: "host", type: "load", activity: activityRef.current },
          window.location.origin
        );
        return;
      }
      handlerRef.current(m);
    }
    window.addEventListener("message", onWindowMessage);
    return () => window.removeEventListener("message", onWindowMessage);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow overflow-hidden">
      {mounted ? (
        <iframe
          ref={frameRef}
          src={`/ergastiri/index.html?embed=${mode}`}
          title={mode === "builder" ? "Δημιουργία δραστηριότητας" : "Δραστηριότητα"}
          className="w-full block border-0"
          style={{ height: "max(560px, calc(100vh - 14rem))" }}
        />
      ) : (
        <div className="p-10 text-center text-slate-400">Φόρτωση...</div>
      )}
    </div>
  );
}
