"use client";

import type { ComponentType } from "react";
import type { ActivityType } from "@/lib/activityTypes";
import type { FinishFn } from "@/lib/activities/types";
import * as P from "@/components/activities/players";
import * as E from "@/components/activities/editors";

type AnyData = Record<string, unknown>;
type Def = {
  blurb: string;
  blank: () => AnyData;
  Editor: ComponentType<{ data: never; onChange: (d: never) => void }>;
  Player: ComponentType<{ data: never; onFinish: FinishFn }>;
};

const def = <D,>(d: {
  blurb: string;
  blank: () => D;
  Editor: ComponentType<{ data: D; onChange: (d: D) => void }>;
  Player: ComponentType<{ data: D; onFinish: FinishFn }>;
}) => d as unknown as Def;

export const REGISTRY: Record<ActivityType, Def> = {
  mc: def({
    blurb: "Ερωτήσεις με επιλογές. Το παιδί βλέπει αμέσως αν έκανε λάθος.",
    blank: () => ({ questions: [{ q: "", why: "", options: [{ t: "", ok: true }, { t: "", ok: false }, { t: "", ok: false }] }], shuffleQ: false, shuffleO: false, test: false }),
    Editor: E.McEditor,
    Player: P.McPlayer,
  }),
  fill: def({
    blurb: "Προτάσεις με λέξεις που λείπουν. Γράφονται ή διαλέγονται από τράπεζα λέξεων.",
    blank: () => ({ text: "Η [γάτα] τρώει ψάρι.\nΤο [μήλο] είναι κόκκινο.", bank: false, shuffle: false, test: false }),
    Editor: E.FillEditor,
    Player: P.FillPlayer,
  }),
  open: def({
    blurb: "Ερωτήσεις που απαντιούνται με δικά του λόγια, με σύγκριση με τη σωστή απάντηση.",
    blank: () => ({ text: "Τι χρώμα έχει ο ουρανός; | Μπλε | μπλε" }),
    Editor: E.OpenEditor,
    Player: P.OpenPlayer,
  }),
  crossword: def({
    blurb: "Δώσε λέξεις και υποδείξεις και το πλέγμα φτιάχνεται μόνο του.",
    blank: () => ({ text: "ΘΑΛΑΣΣΑ | Εκεί κολυμπάμε το καλοκαίρι\nΗΛΙΟΣ | Φέρνει φως\nΑΜΜΟΣ | Στην παραλία\nΣΑΛΙΓΚΑΡΙ | Έχει σπίτι στην πλάτη" }),
    Editor: E.CrossEditor,
    Player: P.CrossPlayer,
  }),
  wheel: def({
    blurb: "Τροχός που γυρίζει και διαλέγει ερώτηση, λέξη ή δραστηριότητα.",
    blank: () => ({ text: "Ζώα | Πες ένα ζώο που ζει στη θάλασσα | Δελφίνι\nΧρώματα | Πες τρία χρώματα | Κόκκινο, μπλε, κίτρινο\nΑριθμοί | Μέτρα από το 1 ως το 10 |", remove: false }),
    Editor: E.WheelEditor,
    Player: P.WheelPlayer,
  }),
  memory: def({
    blurb: "Κάρτες που ταιριάζουν σε ζευγάρια (λέξη-εικόνα, πράξη-αποτέλεσμα).",
    blank: () => ({ text: "3 + 4 | 7\n5 + 5 | 10\n2 + 2 | 4\n6 + 1 | 7" }),
    Editor: E.MemoryEditor,
    Player: P.MemoryPlayer,
  }),
  math: def({
    blurb: "Αυτόματες πράξεις με επιλογή πράξεων και εύρους αριθμών.",
    blank: (): import("@/lib/activities/types").MathData => ({ ops: ["+", "−"], min: 0, max: 20, count: 10, table: "", gap: false, test: false }),
    Editor: E.MathEditor,
    Player: P.MathPlayer,
  }),
};
