import { lines, normW, pairs } from "@/lib/activities/util";

export type FillPart = { t: string } | { blank: string[] };

/** Μία πρόταση ανά γραμμή, οι λέξεις που λείπουν μέσα σε [αγκύλες], εναλλακτικές με |. */
export function parseFill(text: string): FillPart[][] {
  return lines(text)
    .map((line) => {
      const parts: FillPart[] = [];
      let last = 0;
      for (const m of line.matchAll(/\[([^\]]+)\]/g)) {
        const idx = m.index ?? 0;
        parts.push({ t: line.slice(last, idx) });
        parts.push({ blank: m[1].split("|").map((x) => x.trim()).filter(Boolean) });
        last = idx + m[0].length;
      }
      parts.push({ t: line.slice(last) });
      return parts;
    })
    .filter((p) => p.some((x) => "blank" in x && x.blank.length > 0));
}

export type OpenItem = { q: string; a: string; kw: string[] };
export const openItems = (text: string): OpenItem[] =>
  pairs(text)
    .filter((p) => p[0])
    .map((p) => ({
      q: p[0],
      a: p[1] ?? "",
      kw: (p[2] ?? "").split(",").map((x) => x.trim()).filter(Boolean),
    }));

export type CrossEntry = { raw: string; w: string; clue: string };
export function crossEntries(text: string): CrossEntry[] {
  const seen = new Set<string>();
  return pairs(text)
    .map((p) => ({ raw: p[0] ?? "", w: normW(p[0] ?? ""), clue: p[1] ?? "" }))
    .filter((e) => {
      if (e.w.length < 2 || seen.has(e.w)) return false;
      seen.add(e.w);
      return true;
    });
}

export type WheelItem = { label: string; q: string; a: string };
export const wheelItems = (text: string): WheelItem[] =>
  pairs(text)
    .filter((p) => p[0])
    .map((p) => ({ label: p[0], q: p[1] ?? "", a: p[2] ?? "" }));

export const memPairs = (text: string): [string, string][] =>
  pairs(text)
    .filter((p) => p[0] && p[1])
    .slice(0, 12)
    .map((p) => [p[0], p[1]] as [string, string]);
