// SCRUM-410: proves how many distinct puzzles exist. Only a number at or below the proven
// lower bound may be advertised. Lower bound = distinct puzzles actually seen over many seeds.
import { BANDS, kindsFor, makePuzzle } from './maths.ts';
import { PIC_KINDS, makePicturePuzzle, pictureKey } from './picture.ts';
const SEEDS = 50000;
const bound: Record<string, number> = {};
for (const b of BANDS) {
  if (b === '3-4') continue; // handled with pictures below
  const seen = new Set<string>();
  for (const k of kindsFor(b)) for (let s = 0; s < SEEDS; s++) seen.add(makePuzzle(b, k, s).prompt);
  bound[b] = seen.size;
}
const pics = new Set<string>(); const nums = new Set<string>();
for (const k of PIC_KINDS) for (let s = 0; s < SEEDS; s++) { const p = makePicturePuzzle(k, s); pics.add(pictureKey(p, 'picture')); nums.add(pictureKey(p, 'number')); }
const m34 = new Set<string>(); for (const k of kindsFor('3-4')) for (let s = 0; s < SEEDS; s++) m34.add(makePuzzle('3-4', k, s).prompt);
bound['3-4'] = pics.size;
console.log(JSON.stringify({ seedsPerKind: SEEDS, provedLowerBoundByBand: bound, ages34NumberLevelOnly: nums.size, ages34PlainSums: m34.size }, null, 1));
// Rule: advertise at most the smallest per-band figure, rounded down to a thousand, and only the 4,000 target.
const minBand = Math.min(...Object.values(bound));
const advertisable = Math.floor(minBand / 1000) * 1000;
console.log('Smallest band bound:', minBand, '-> advertisable now (rounded down):', advertisable);
if (advertisable < 4000) { console.log('FAIL: below the 4,000 target'); process.exit(1); }
console.log('ALL PASS');
