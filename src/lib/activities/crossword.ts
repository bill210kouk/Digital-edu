import type { CrossEntry } from "@/lib/activities/parse";

type Cell = { ch: string; a?: boolean; d?: boolean };
type Dir = "a" | "d";

export type CrossWord = {
  w: string;
  clue: string;
  dir: Dir;
  r: number;
  c: number;
  keys: string[];
  num: number;
};

export type Crossword = {
  cells: Map<string, string>;
  words: CrossWord[];
  unplaced: CrossEntry[];
  rows: number;
  cols: number;
  nums: Map<string, number>;
};

type Attempt = {
  score: number;
  placed: { e: CrossEntry; r: number; c: number; dir: Dir }[];
  left: CrossEntry[];
  g: Map<string, Cell>;
  r0: number;
  c0: number;
  rows: number;
  cols: number;
};

/** Φτιάχνει πλέγμα σταυρολέξου δοκιμάζοντας πολλές τυχαίες διατάξεις και κρατώντας την καλύτερη. */
export function genCross(entries: CrossEntry[]): Crossword {
  let best: Attempt | null = null;
  for (let t = 0; t < 60; t++) {
    const order = entries.slice().sort((a, b) => b.w.length - a.w.length + (t ? (Math.random() - 0.5) * 4 : 0));
    const g = new Map<string, Cell>();
    const placed: Attempt["placed"] = [];
    const left: CrossEntry[] = [];
    const get = (r: number, c: number) => g.get(r + "," + c);

    const fits = (w: string, r: number, c: number, dir: Dir) => {
      const dr = dir === "d" ? 1 : 0;
      const dc = dir === "a" ? 1 : 0;
      if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
      let inter = 0;
      for (let i = 0; i < w.length; i++) {
        const rr = r + dr * i;
        const cc = c + dc * i;
        const cell = get(rr, cc);
        if (cell) {
          if (cell.ch !== w[i] || cell[dir]) return -1;
          inter++;
        } else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
      }
      return inter;
    };

    const put = (e: CrossEntry, r: number, c: number, dir: Dir) => {
      const dr = dir === "d" ? 1 : 0;
      const dc = dir === "a" ? 1 : 0;
      for (let i = 0; i < e.w.length; i++) {
        const k = r + dr * i + "," + (c + dc * i);
        const cell: Cell = g.get(k) ?? { ch: e.w[i] };
        cell[dir] = true;
        g.set(k, cell);
      }
      placed.push({ e, r, c, dir });
    };

    order.forEach((e) => {
      if (!placed.length) {
        put(e, 0, 0, "a");
        return;
      }
      let cand: [number, number, Dir][] = [];
      let bi = 0;
      for (const [k, cell] of g) {
        const [R, C] = k.split(",").map(Number);
        for (let i = 0; i < e.w.length; i++) {
          if (e.w[i] !== cell.ch) continue;
          for (const dir of ["a", "d"] as Dir[]) {
            const r = dir === "d" ? R - i : R;
            const c = dir === "a" ? C - i : C;
            const n = fits(e.w, r, c, dir);
            if (n > 0) {
              if (n > bi) {
                bi = n;
                cand = [[r, c, dir]];
              } else if (n === bi) cand.push([r, c, dir]);
            }
          }
        }
      }
      if (cand.length) {
        const [r, c, dir] = cand[Math.floor(Math.random() * cand.length)];
        put(e, r, c, dir);
      } else left.push(e);
    });

    let r0 = Infinity;
    let c0 = Infinity;
    let r1 = -Infinity;
    let c1 = -Infinity;
    g.forEach((_, k) => {
      const [r, c] = k.split(",").map(Number);
      r0 = Math.min(r0, r);
      c0 = Math.min(c0, c);
      r1 = Math.max(r1, r);
      c1 = Math.max(c1, c);
    });
    const rows = r1 - r0 + 1;
    const cols = c1 - c0 + 1;
    const score = placed.length * 1000 - rows * cols - Math.abs(rows - cols) * 3;
    if (!best || score > best.score) best = { score, placed, left, g, r0, c0, rows, cols };
  }

  if (!best) return { cells: new Map(), words: [], unplaced: entries, rows: 0, cols: 0, nums: new Map() };
  const b = best;
  const cells = new Map<string, string>();
  b.g.forEach((cell, k) => {
    const [r, c] = k.split(",").map(Number);
    cells.set(r - b.r0 + "," + (c - b.c0), cell.ch);
  });
  const words: CrossWord[] = b.placed.map((p) => {
    const dr = p.dir === "d" ? 1 : 0;
    const dc = p.dir === "a" ? 1 : 0;
    const keys: string[] = [];
    for (let i = 0; i < p.e.w.length; i++) keys.push(p.r - b.r0 + dr * i + "," + (p.c - b.c0 + dc * i));
    return { w: p.e.w, clue: p.e.clue, dir: p.dir, r: p.r - b.r0, c: p.c - b.c0, keys, num: 0 };
  });
  const nums = new Map<string, number>();
  let n = 0;
  words
    .slice()
    .sort((x, y) => x.r - y.r || x.c - y.c)
    .forEach((w) => {
      const k = w.r + "," + w.c;
      if (!nums.has(k)) nums.set(k, ++n);
    });
  words.forEach((w) => {
    w.num = nums.get(w.r + "," + w.c) ?? 0;
  });
  return { cells, words, unplaced: b.left, rows: b.rows, cols: b.cols, nums };
}
