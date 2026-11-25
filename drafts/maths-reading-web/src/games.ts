// Visual and interactive games built on the puzzle engine. Tap only; no drag, no flashing.
import { rng, type AgeBand, type Puzzle } from './maths.ts';
import { progressionSet, pictureProgressionSet } from './progression.ts';
import type { PicturePuzzle } from './picture.ts';

// Ten-frame "make N": tap circles to fill the frame with exactly N.
export interface FramePuzzle { id: string; band: AgeBand; n: number; speak: string }
export function makeFrame(band: AgeBand, seed: number): FramePuzzle {
  const r = rng(seed * 13 + 5); const lo = band === '3-4' ? 1 : 3; const hi = band === '3-4' ? 5 : 10;
  const n = lo + Math.floor(r() * (hi - lo + 1));
  return { id: `${band}:frame:${seed}`, band, n, speak: `Make ${n}. Tap the circles to fill the frame.` };
}
// Number-line hop for adding and taking away inside 20.
export interface Hop { a: number; b: number; op: '+' | '-'; answer: number }
export function hopPlan(p: Puzzle): Hop | null {
  const m = p.prompt.match(/^(\d+) ([+-]) (\d+) = \?$/); if (!m) return null;
  const a = +m[1], b = +m[3], op = m[2] as '+' | '-'; const answer = op === '+' ? a + b : a - b;
  if (a > 20 || answer > 20 || answer < 0) return null;
  return { a, b, op, answer };
}
import type { MeasPuzzle } from './measure.ts';
export type Item = { kind: 'meas'; p: MeasPuzzle } | { kind: 'num'; p: Puzzle } | { kind: 'pic'; p: PicturePuzzle } | { kind: 'frame'; p: FramePuzzle };
// A long easy-to-harder run with a ten-frame game after every third question for ages 3 to 6.
export function playList(band: AgeBand, base: number, count = 30): Item[] {
  const core: Item[] = band === '3-4' ? pictureProgressionSet(base, count).map(p => ({ kind: 'pic' as const, p })) : progressionSet(band, base, count).map(p => ({ kind: 'num' as const, p }));
  if (band !== '3-4' && band !== '5-6') return core;
  const out: Item[] = []; core.forEach((it, i) => { out.push(it); if (i % 3 === 2) out.push({ kind: 'frame', p: makeFrame(band, base * 100 + i) }); });
  return out;
}
