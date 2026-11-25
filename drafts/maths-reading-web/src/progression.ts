// A set of puzzles goes from easy to harder. Deterministic: same band and seed give the same set.
import { BANDS, kindsFor, makePuzzle, type AgeBand, type Puzzle, type Kind } from './maths.ts';
import { PIC_KINDS, makePicturePuzzle, type PicturePuzzle } from './picture.ts';
const MAXV: Record<AgeBand, number> = { '3-4': 5, '5-6': 20, '7-8': 100, '9-10': 1000, '11-12': 10000 };
const KW: Record<Kind, number> = { compare: 0, add: 0.05, subtract: 0.15, order: 0.2, three: 0.25, missing: 0.3, multiply: 0.4, divide: 0.5 };
export function difficulty(p: Puzzle): number {
  return Math.log(1 + p.answer) / Math.log(1 + MAXV[p.band]) + KW[p.kind];
}
export function pictureDifficulty(p: PicturePuzzle): number {
  if (p.kind === 'count') return p.answer / 10;
  if (p.kind === 'odd') return 0.15 + p.items!.length / 20;
  if (p.kind === 'onemore') return 0.3 + p.answer / 20;
  return 0.4 + (5 - Math.abs(p.groups[0].n - p.groups[1].n)) / 10; // closer groups are harder
}
function spread<T>(sorted: T[], count: number): T[] {
  if (count <= 1) return sorted.slice(0, 1);
  return Array.from({ length: count }, (_, i) => sorted[Math.round((i * (sorted.length - 1)) / (count - 1))]);
}
export function progressionSet(band: AgeBand, base: number, count: number): Puzzle[] {
  const kinds = kindsFor(band); const seen = new Set<string>(); const pool: Puzzle[] = [];
  for (let i = 0; pool.length < count * 8 && i < count * 40; i++) { const p = makePuzzle(band, kinds[i % kinds.length], base * 1000 + i); if (!seen.has(p.prompt)) { seen.add(p.prompt); pool.push(p); } }
  pool.sort((a, b) => difficulty(a) - difficulty(b) || (a.id < b.id ? -1 : 1));
  return spread(pool, count);
}
export function pictureProgressionSet(base: number, count: number): PicturePuzzle[] {
  const seen = new Set<string>(); const pool: PicturePuzzle[] = [];
  for (let i = 0; pool.length < count * 8 && i < count * 40; i++) { const p = makePicturePuzzle(PIC_KINDS[i % PIC_KINDS.length], base * 1000 + i); const key = p.kind + JSON.stringify(p.groups.map(g => g.n)) + (p.kind === 'odd' ? p.answer : ''); if (!seen.has(key)) { seen.add(key); pool.push(p); } }
  pool.sort((a, b) => pictureDifficulty(a) - pictureDifficulty(b) || (a.id < b.id ? -1 : 1));
  return spread(pool, count);
}
export { BANDS };
