// Yaanstep Sprouts maths puzzle generator (draft, on-device, no data stored).
// A puzzle is fully determined by (band, kind, seed), so nothing needs to be stored.
export type AgeBand = '3-4' | '5-6' | '7-8' | '9-10' | '11-12';
export type Kind = 'add' | 'subtract' | 'multiply' | 'divide' | 'missing' | 'compare' | 'three' | 'order';
export interface Puzzle { id: string; band: AgeBand; kind: Kind; prompt: string; answer: number; choices: number[]; }

export const BANDS: AgeBand[] = ['3-4', '5-6', '7-8', '9-10', '11-12'];
const KINDS: Record<AgeBand, Kind[]> = {
  '3-4': ['add', 'compare'],
  '5-6': ['add', 'subtract', 'missing', 'compare', 'three', 'order'],
  '7-8': ['add', 'subtract', 'multiply', 'missing', 'compare'],
  '9-10': ['add', 'subtract', 'multiply', 'divide', 'missing', 'compare'],
  '11-12': ['add', 'subtract', 'multiply', 'divide', 'missing', 'compare'],
};
const MAX: Record<AgeBand, number> = { '3-4': 5, '5-6': 20, '7-8': 100, '9-10': 1000, '11-12': 10000 };

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

export function kindsFor(band: AgeBand): Kind[] { return KINDS[band]; }

export interface Opts { sumMax?: number; max?: number; lim?: number; total?: number; factors?: number[] }
export function makePuzzle(band: AgeBand, kind: Kind, seed: number, opts?: Opts): Puzzle {
  const r = rng(seed * 31 + BANDS.indexOf(band) * 7 + 1);
  const max = opts?.max ?? MAX[band];
  let prompt = '', answer = 0; let must: number[] = []; // numbers that must be among the choices
  if (kind === 'add') { let a: number, b: number; if (opts?.sumMax) { a = int(r, 1, opts.sumMax - 1); b = int(r, 1, opts.sumMax - a); } else { a = int(r, 1, max); b = int(r, 1, max); } prompt = `${a} + ${b} = ?`; answer = a + b; }
  else if (kind === 'subtract') { const a = int(r, 2, max); const b = int(r, 1, a - 1); prompt = `${a} - ${b} = ?`; answer = a - b; }
  else if (kind === 'multiply') { const lim = opts?.lim ?? (band === '7-8' ? 10 : band === '9-10' ? 12 : 25); const a = int(r, 2, lim); const b = opts?.factors ? opts.factors[Math.floor(r() * opts.factors.length)] : int(r, 2, lim); prompt = `${a} x ${b} = ?`; answer = a * b; }
  else if (kind === 'divide') { const lim = opts?.lim ?? (band === '9-10' ? 12 : 25); const b = opts?.factors ? opts.factors[Math.floor(r() * opts.factors.length)] : int(r, 2, lim); const q = int(r, 2, lim); prompt = `${b * q} / ${b} = ?`; answer = q; }
  else if (kind === 'missing') { if (opts?.total) { const a = int(r, 1, opts.total - 1); const b = opts.total - a; prompt = `${a} + ? = ${opts.total}`; answer = b; } else { const a = int(r, 1, max); const b = int(r, 1, max); prompt = `${a} + ? = ${a + b}`; answer = b; } }
  else if (kind === 'three') { const a = int(r, 1, 9); const b = int(r, 1, 9); const c = int(r, 1, 9); prompt = `${a} + ${b} + ${c} = ?`; answer = a + b + c; }
  else if (kind === 'order') {
    const set = new Set<number>(); while (set.size < 3) set.add(int(r, 1, max)); const t = [...set];
    const small = r() < 0.5; prompt = `Which is ${small ? 'smallest' : 'biggest'}: ${t[0]}, ${t[1]} or ${t[2]}?`; answer = small ? Math.min(...t) : Math.max(...t);
    const ch = new Set<number>(t); let x = 1; while (ch.size < 4) { if (!ch.has(x)) ch.add(x); x++; }
    return { id: `${band}:${kind}:${seed}`, band, kind, prompt, answer, choices: [...ch].sort((p, q) => p - q) };
  }
  else { const a = int(r, 1, max); let b = int(r, 1, max); if (b === a) b = a + 1; prompt = `Which is bigger: ${a} or ${b}?`; answer = Math.max(a, b); must = [a, b]; }
  const choices = new Set<number>([answer, ...must]);
  const spread = Math.max(2, Math.round(answer * 0.2));
  let guard = 0;
  while (choices.size < 4 && guard++ < 50) { const c = answer + int(r, -spread, spread); if (c >= 0 && c !== answer) choices.add(c); }
  let n = 1; while (choices.size < 4) choices.add(answer + n++);
  const sorted = [...choices].sort((x, y) => x - y);
  return { id: `${band}:${kind}:${seed}`, band, kind, prompt, answer, choices: sorted };
}

export function dailyPuzzles(band: AgeBand, day: number, count = 5): Puzzle[] {
  const kinds = KINDS[band];
  return Array.from({ length: count }, (_, i) => makePuzzle(band, kinds[(day + i) % kinds.length], day * 1000 + i));
}

// Distinct puzzles = distinct (prompt) text; used by the count test.
export function countDistinct(band: AgeBand, seeds: number): number {
  const seen = new Set<string>();
  for (const k of KINDS[band]) for (let s = 0; s < seeds; s++) seen.add(makePuzzle(band, k, s).prompt);
  return seen.size;
}
