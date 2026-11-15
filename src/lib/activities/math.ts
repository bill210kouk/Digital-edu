import type { MathData } from "@/lib/activities/types";

export type MathItem = { text: string; ans: number };

export function mkMath(d: MathData): MathItem {
  const ops = d.ops && d.ops.length ? d.ops : ["+"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const lo = Math.max(0, Number(d.min) || 0);
  const hi = Math.max(lo + 1, Number(d.max) || 10);
  const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  const tb = Number(d.table) || 0;
  let a: number;
  let b: number;
  let res: number;
  if (op === "+") {
    a = rnd(lo, hi);
    b = rnd(lo, hi);
    res = a + b;
  } else if (op === "−") {
    a = rnd(lo, hi);
    b = rnd(lo, a);
    res = a - b;
  } else if (op === "×") {
    if (tb) {
      a = tb;
      b = rnd(1, 10);
    } else {
      a = rnd(lo, hi);
      b = rnd(lo, hi);
    }
    res = a * b;
  } else {
    b = tb || rnd(Math.max(1, lo), Math.max(1, hi));
    const q = rnd(lo, hi);
    a = b * q;
    res = q;
  }
  return d.gap ? { text: `${a} ${op} ? = ${res}`, ans: b } : { text: `${a} ${op} ${b} = ?`, ans: res };
}
