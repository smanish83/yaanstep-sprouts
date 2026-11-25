// Extra maths ideas, generated at play time from a seed (no stored puzzles, no network).
// doubles, halves, make-ten strategy, balance (equal sign), number families, place value, fractions of amounts,
// word problems, and bar-model comparison problems.
export type IdeaKind = 'double' | 'half' | 'maketen' | 'balance' | 'family' | 'place' | 'fraction' | 'word' | 'barword';
export const IDEA_KINDS: IdeaKind[] = ['double', 'half', 'maketen', 'balance', 'family', 'place', 'fraction', 'word', 'barword'];
export interface IdeaOpts { max?: number; digits?: number; dens?: number[]; nums?: boolean; mul?: boolean; two?: boolean }
export interface IdeaOut { prompt: string; answer: number; must?: number[] }
type R = () => number;
const int = (r: R, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T>(r: R, xs: T[]): T => xs[Math.floor(r() * xs.length)];
export const NAMES = ['Asha', 'Ben', 'Mia', 'Omar', 'Lena', 'Sam', 'Priya', 'Noah'];
export const THINGS = ['stickers', 'marbles', 'books', 'cards', 'apples', 'pencils'];
export const FRAC_WORD: Record<number, string> = { 2: 'Half', 3: 'A third', 4: 'A quarter', 5: 'A fifth', 10: 'A tenth' };
const PLACE = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];

export function makeIdea(kind: IdeaKind, r: R, o: IdeaOpts = {}): IdeaOut {
  const max = o.max ?? 10;
  if (kind === 'double') { const n = int(r, 1, max); return { prompt: `Double ${n} = ?`, answer: 2 * n }; }
  if (kind === 'half') { const n = 2 * int(r, 1, Math.floor(max / 2)); return { prompt: `Half of ${n} = ?`, answer: n / 2 }; }
  if (kind === 'maketen') {
    const a = int(r, 6, 9); const b = int(r, 11 - a, 9); const f = int(r, 0, 2);
    if (f === 0) return { prompt: `To add ${a} + ${b}, first make 10: ${a} + ? = 10`, answer: 10 - a };
    if (f === 1) return { prompt: `${a} + ${b} = 10 + ?`, answer: a + b - 10 };
    return { prompt: `${a} + ${b} = ?`, answer: a + b };
  }
  if (kind === 'balance') {
    const a = int(r, 1, max - 2); const b = int(r, 1, max - a); const T = a + b; const f = int(r, 0, 2);
    if (f === 0) { const c = int(r, 1, T - 1); return { prompt: `${a} + ${b} = ? + ${c}`, answer: T - c }; }
    if (f === 1) { const c = int(r, 1, T - 1); return { prompt: `${T} = ${c} + ?`, answer: T - c }; }
    return { prompt: `? + ${b} = ${T}`, answer: a };
  }
  if (kind === 'family') {
    if (o.mul) { const a = int(r, 2, 10); const b = int(r, 2, 10); return r() < 0.5 ? { prompt: `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${b} = ?`, answer: a } : { prompt: `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ?`, answer: b }; }
    const a = int(r, 1, max - 1); const b = int(r, 1, max - a); return r() < 0.5 ? { prompt: `${a} + ${b} = ${a + b}, so ${a + b} − ${b} = ?`, answer: a } : { prompt: `${a} + ${b} = ${a + b}, so ${a + b} − ${a} = ?`, answer: b };
  }
  if (kind === 'place') {
    const nd = o.digits ?? 3; const ds: number[] = []; while (ds.length < nd) { const d = int(r, 1, 9); if (!ds.includes(d)) ds.push(d); }
    const n = Number(ds.join('')); const f = int(r, 0, 2); const posOf = (i: number) => nd - 1 - i; const i = int(r, 0, nd - 1); const d = ds[i]; const p = posOf(i);
    const vals = ds.map((x, k) => x * 10 ** posOf(k));
    if (f === 0) return { prompt: `What is the value of the ${d} in ${n}?`, answer: d * 10 ** p, must: [d * 10 ** p, ...vals.filter(v => v !== d * 10 ** p)] };
    if (f === 1) return { prompt: `${vals.join(' + ')} = ?`, answer: n };
    const q = Math.max(1, Math.min(nd - 1, int(r, 1, nd - 1))); const dig = ds[nd - 1 - q];
    return { prompt: `Which digit is in the ${PLACE[q]} place of ${n}?`, answer: dig, must: ds.slice(0, 4) };
  }
  if (kind === 'fraction') {
    const dens = o.dens ?? [2]; const d = pick(r, dens); const k = int(r, 1, Math.max(1, Math.floor(max / d))); const amt = d * k;
    const num = o.nums && d > 2 ? int(r, 1, d - 1) : 1;
    return num === 1 ? { prompt: `${FRAC_WORD[d]} of ${amt} = ?`, answer: k } : { prompt: `${num}/${d} of ${amt} = ?`, answer: num * k };
  }
  const N = pick(r, NAMES); let M = pick(r, NAMES); while (M === N) M = pick(r, NAMES); const T = pick(r, THINGS);
  if (kind === 'word') {
    const forms = o.two ? ['two'] : o.mul ? ['add', 'sub', 'mul', 'div'] : ['add', 'sub', 'tot', 'diff']; const f = pick(r, forms);
    if (f === 'add') { const a = int(r, 1, max - 1); const b = int(r, 1, max - a); return { prompt: `${N} has ${a} ${T}. ${N} finds ${b} more. How many does ${N} have now?`, answer: a + b }; }
    if (f === 'sub') { const a = int(r, 2, max); const b = int(r, 1, a - 1); return { prompt: `${N} has ${a} ${T}. ${N} gives away ${b}. How many are left?`, answer: a - b }; }
    if (f === 'tot') { const a = int(r, 1, max - 1); const b = int(r, 1, max - a); return { prompt: `${N} has ${a} ${T} and ${M} has ${b}. How many do they have together?`, answer: a + b }; }
    if (f === 'diff') { const a = int(r, 2, max); const b = int(r, 1, a - 1); return { prompt: `${N} has ${a} ${T}. ${M} has ${b}. How many more does ${N} have?`, answer: a - b }; }
    if (f === 'mul') { const g = int(r, 2, 9); const k = int(r, 2, 10); return { prompt: `There are ${g} bags with ${k} ${T} in each bag. How many ${T} are there in all?`, answer: g * k }; }
    if (f === 'div') { const g = int(r, 2, 9); const k = int(r, 2, 10); return { prompt: `${g * k} ${T} are shared equally between ${g} children. How many does each child get?`, answer: k }; }
    const a = int(r, 5, max - 5); const b = int(r, 1, max - a); const c = int(r, 1, a + b - 1);
    return { prompt: `${N} has ${a} ${T}. ${N} gets ${b} more, then gives away ${c}. How many are left?`, answer: a + b - c };
  }
  // barword: comparison and part-whole problems drawn as bars
  const a = int(r, 3, max); const d = int(r, 1, Math.max(1, Math.min(a - 1, Math.floor(max / 2)))); const f = int(r, 0, 3);
  if (f === 0) return { prompt: `${N} has ${a + d} ${T}, ${d} more than ${M}. How many does ${M} have?`, answer: a };
  if (f === 1) return { prompt: `${M} has ${a} ${T}. ${N} has ${d} more than ${M}. How many does ${N} have?`, answer: a + d };
  if (f === 2) return { prompt: `${N} and ${M} have ${a + d} ${T} altogether. ${N} has ${a}. How many does ${M} have?`, answer: d };
  return { prompt: `${N} has ${a} ${T}. ${M} has ${d} fewer. How many does ${M} have?`, answer: a - d };
}
