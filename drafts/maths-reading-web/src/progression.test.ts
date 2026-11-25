import assert from 'node:assert';
import { BANDS, progressionSet, pictureProgressionSet, difficulty, pictureDifficulty } from './progression.ts';
for (const b of BANDS) if (b !== '3-4') for (const n of [5, 10]) for (let base = 1; base < 300; base++) {
  const s = progressionSet(b, base, n);
  assert.equal(s.length, n); assert.equal(new Set(s.map(p => p.prompt)).size, n, 'no repeats in a set');
  for (let i = 1; i < n; i++) assert.ok(difficulty(s[i]) >= difficulty(s[i - 1]), `easy to hard ${b} ${base}`);
  assert.deepEqual(progressionSet(b, base, n).map(p => p.id), s.map(p => p.id), 'deterministic');
  assert.ok(difficulty(s[n - 1]) > difficulty(s[0]), 'last harder than first');
}
for (const n of [5, 10]) for (let base = 1; base < 300; base++) {
  const s = pictureProgressionSet(base, n);
  assert.equal(s.length, n);
  for (let i = 1; i < n; i++) assert.ok(pictureDifficulty(s[i]) >= pictureDifficulty(s[i - 1]), 'picture easy to hard');
}
console.log('ALL PASS');
