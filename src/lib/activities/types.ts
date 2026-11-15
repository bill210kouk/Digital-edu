export type Review = {
  ok: boolean;
  q: string;
  yours: string;
  correct?: string;
  why?: string;
};

export type FinishFn = (score: number, total: number, note?: string, review?: Review[]) => void;
export type DoneFn = (first: boolean, rev?: Omit<Review, "ok">) => void;

export type McQ = { q: string; why?: string; options: { t: string; ok: boolean }[] };
export type McData = { questions: McQ[]; shuffleQ?: boolean; shuffleO?: boolean; test?: boolean };
export type FillData = { text: string; bank?: boolean; shuffle?: boolean; test?: boolean };
export type OpenData = { text: string };
export type CrosswordData = { text: string };
export type WheelData = { text: string; remove?: boolean };
export type MemoryData = { text: string };
export type MathData = {
  ops: string[];
  min: number | "";
  max: number | "";
  count: number | "";
  table: number | "";
  gap?: boolean;
  test?: boolean;
};
