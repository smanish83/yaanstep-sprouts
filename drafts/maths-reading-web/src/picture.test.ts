import assert from 'node:assert';
import { PIC_KINDS, makePicturePuzzle, dailyPicturePuzzles, pictureKey } from './picture.ts';
for (const k of PIC_KINDS) for (let s = 0; s < 5000; s++) {
  const p = makePicturePuzzle(k, s);
  assert.deepEqual(makePicturePuzzle(k, s), p, 'deterministic');
  assert.ok(p.speak.length > 0 && p.alt.length > 0, 'speak and alt text present');
  assert.equal(new Set(p.choices).size, p.choices.length);
  assert.ok(p.choices.includes(p.answer), 'answer among choices');
  if (k === 'count') { assert.equal(p.groups.length, 1); assert.equal(p.answer, p.groups[0].n); assert.equal(p.choices.length, 4); }
  if (k === 'onemore') { assert.equal(p.answer, p.groups[0].n + 1); assert.ok(p.answer <= 5); assert.equal(p.choices.length, 4); }
  if (k === 'more') { const [a, b] = p.groups; assert.notEqual(a.n, b.n); assert.equal(p.answer, a.n > b.n ? 0 : 1); assert.notEqual(a.color, b.color); assert.deepEqual(p.choices, [0, 1]); }
  assert.ok(p.groups.every(g => g.n >= 1 && g.n <= 5), 'counts stay 1 to 5');
  if (k !== 'odd') assert.ok(p.choices.every(c => c >= 0 && c <= 5), 'choices stay 0 to 5');
  if (k === 'odd') { const it = p.items!; assert.ok(it.length >= 3 && it.length <= 5); const odd = it[p.answer]; assert.equal(it.filter(x => x.shape === odd.shape).length, 1, 'exactly one odd'); assert.ok(it.filter((_, i) => i !== p.answer).every(x => x.shape === it[(p.answer + 1) % it.length].shape), 'others identical'); assert.equal(p.choices.length, it.length); }
}
assert.equal(dailyPicturePuzzles(7).length, 5);
for (const level of ['picture', 'number'] as const) {
  const seen = new Set<string>();
  for (const k of PIC_KINDS) for (let s = 0; s < 60000; s++) seen.add(pictureKey(makePicturePuzzle(k, s), level));
  console.log('ages 3-4 distinct at', level, 'level (lower bound from 60,000 seeds per kind):', seen.size);
}
console.log('ALL PASS');
