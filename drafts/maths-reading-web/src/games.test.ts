import assert from 'node:assert';
import { makeFrame, hopPlan, playList } from './games.ts';
import { makePuzzle, BANDS } from './maths.ts';
import { recordAnswer, newProgress } from './points.ts';
for (const b of ['3-4', '5-6'] as const) for (let s = 0; s < 2000; s++) { const f = makeFrame(b, s); assert.ok(f.n >= (b === '3-4' ? 1 : 3) && f.n <= (b === '3-4' ? 5 : 10)); assert.deepEqual(makeFrame(b, s), f); }
let hops = 0;
for (const b of BANDS) for (const k of ['add', 'subtract'] as const) for (let s = 0; s < 2000; s++) { const p = makePuzzle(b, k, s); const h = hopPlan(p); if (h) { hops++; assert.equal(h.answer, p.answer); assert.ok(h.b >= 1); assert.ok(h.a <= 20); } }
assert.ok(hops > 500, 'hop games available');
for (const b of BANDS) for (let base = 1; base < 40; base++) { const l = playList(b, base); const core = l.filter(i => i.kind !== 'frame'); assert.equal(core.length, 30, `${b} has 30 questions`); if (b === '3-4' || b === '5-6') assert.equal(l.filter(i => i.kind === 'frame').length, 10); else assert.equal(l.length, 30); }
let p = recordAnswer(newProgress(), 10, true); assert.equal(p.points, 10); assert.equal(p.streak, 1);
p = recordAnswer(p, 10, false); assert.equal(p.points, 15); assert.equal(p.streak, 1, 'streak counts once per day');
p = recordAnswer(p, 11, true); assert.equal(p.streak, 2);
console.log('ALL PASS');
