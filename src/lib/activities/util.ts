export const stripAcc = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Σύγκριση απαντήσεων: χωρίς τόνους, πεζά, τελικό ς = σ. */
export const norm = (s: string) =>
  stripAcc(s).toLowerCase().replace(/ς/g, "σ").trim().replace(/\s+/g, " ");

/** Γράμματα σταυρολέξου: κεφαλαία χωρίς τόνους. */
export const normW = (s: string) => stripAcc(s).toUpperCase().replace(/[^Α-ΩA-Z0-9]/g, "");

export function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const lines = (t: string) =>
  String(t ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const pairs = (t: string) => lines(t).map((l) => l.split("|").map((x) => x.trim()));

export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "el-GR";
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
