// Picture puzzles for ages 3-4 (no reading needed). Shapes are drawn by the app from simple
// original geometry (circle, square, triangle, star, heart); nothing is copied from anywhere.
// Tap only: every choice is one big button. No drag and drop, no flashing, no autoplay.
import { rng } from './maths.ts';
export const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'] as const;
export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
export type Shape = (typeof SHAPES)[number];
export type Color = (typeof COLORS)[number];
export type PicKind = 'count' | 'more' | 'onemore' | 'odd';
export const MAX_COUNT = 5; // counts stay within 1 to 5 for ages 3-4 (Manish, 15 Nov 15:23)
export interface Group { shape: Shape; color: Color; n: number }
export interface PicturePuzzle {
  id: string; band: '3-4'; kind: PicKind;
  speak: string;        // text for read-aloud (a child who cannot read still gets the question)
  alt: string;          // text description for screen readers
  groups: Group[];      // what to draw
  items?: { shape: Shape; color: Color }[]; // for 'odd': the objects in order
  answer: number;       // count; index of the group with more; index of the odd object
  choices: number[];    // 4 numbers for count/onemore; [0, 1] for more
}
export const PIC_KINDS: PicKind[] = ['count', 'more', 'onemore', 'odd'];
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T>(r: () => number, a: readonly T[]): T => a[Math.floor(r() * a.length)];
function numberChoices(r: () => number, answer: number, hi: number): number[] {
  const s = new Set<number>([answer]);
  while (s.size < 4) { const c = int(r, 1, hi); s.add(c); }
  return [...s].sort((a, b) => a - b);
}
export function makePicturePuzzle(kind: PicKind, seed: number): PicturePuzzle {
  const r = rng(seed * 17 + PIC_KINDS.indexOf(kind) * 5 + 3);
  const shape = pick(r, SHAPES), color = pick(r, COLORS);
  if (kind === 'count') {
    const n = int(r, 1, MAX_COUNT);
    return { id: `3-4:count:${seed}`, band: '3-4', kind, speak: `How many ${color} ${shape}s can you see?`, alt: `${n} ${color} ${shape}${n === 1 ? '' : 's'}`, groups: [{ shape, color, n }], answer: n, choices: numberChoices(r, n, MAX_COUNT) };
  }
  if (kind === 'onemore') {
    const n = int(r, 1, MAX_COUNT - 1);
    return { id: `3-4:onemore:${seed}`, band: '3-4', kind, speak: `Here are ${n} ${color} ${shape}${n === 1 ? '' : 's'}. How many are there if we add one more?`, alt: `${n} ${color} ${shape}${n === 1 ? '' : 's'}, one more is coming`, groups: [{ shape, color, n }], answer: n + 1, choices: numberChoices(r, n + 1, MAX_COUNT) };
  }
  if (kind === 'odd') {
    const n = int(r, 3, 5); const odd = pick(r, SHAPES.filter(x => x !== shape)); const index = int(r, 0, n - 1);
    const items = Array.from({ length: n }, (_, i) => ({ shape: i === index ? odd : shape, color }));
    return { id: `3-4:odd:${seed}`, band: '3-4', kind, speak: 'Which one is different? Tap it.', alt: `${n} ${color} shapes; one is a ${odd}, the others are ${shape}s`, groups: [{ shape, color, n: n - 1 }, { shape: odd, color, n: 1 }], items, answer: index, choices: items.map((_, i) => i) };
  }
  const a = int(r, 1, MAX_COUNT); let b = int(r, 1, MAX_COUNT); if (b === a) b = a === MAX_COUNT ? MAX_COUNT - 1 : a + 1;
  const c1 = color; let c2 = pick(r, COLORS); if (c2 === c1) c2 = COLORS[(COLORS.indexOf(c1) + 1) % COLORS.length];
  return { id: `3-4:more:${seed}`, band: '3-4', kind, speak: 'Which group has more? Tap it.', alt: `Left: ${a} ${c1} ${shape}s. Right: ${b} ${c2} ${shape}s.`, groups: [{ shape, color: c1, n: a }, { shape, color: c2, n: b }], answer: a > b ? 0 : 1, choices: [0, 1] };
}
export function dailyPicturePuzzles(day: number, count = 5): PicturePuzzle[] {
  return Array.from({ length: count }, (_, i) => makePicturePuzzle(PIC_KINDS[(day + i) % PIC_KINDS.length], day * 1000 + i));
}
// Two honest counts. "Picture level" counts different pictures; "number level" counts different
// number questions (the same sum with other shapes or colors is NOT a new number question).
export function pictureKey(p: PicturePuzzle, level: 'picture' | 'number'): string {
  if (level === 'picture') return p.kind + JSON.stringify(p.groups) + (p.kind === 'odd' ? p.answer : '');
  return p.kind + p.groups.map(g => g.n).join(',') + (p.kind === 'odd' ? ':' + p.answer : '');
}
