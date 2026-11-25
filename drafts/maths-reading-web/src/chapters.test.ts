import assert from 'node:assert';
import { BANDS } from './maths.ts';
import { CHAPTERS, chapterQuestions, tutorialFor, QUESTIONS_PER_CHAPTER } from './chapters.ts';
import { difficulty, pictureDifficulty } from './progression.ts';
let chapters = 0, steps = 0;
for (const b of BANDS) for (const ch of CHAPTERS[b]) {
  chapters++;
  const t = tutorialFor(ch); steps += t.length; assert.ok(t.length >= 3, `${ch.id} has a tutorial`);
  for (const s of t) {
    // every equation written in a tutorial must be arithmetically right
    for (const m of (s.say + ' ' + (s.v.t === 'text' ? s.v.big : '')).matchAll(/(?<![+−×÷] )(?<![\d,])(\d+) ([+−×÷]) (\d+) = (\d+)(?! [+−×÷] )/g)) { const a = +m[1], c = +m[3], r = +m[4]; const e = m[2] === '+' ? a + c : m[2] === '−' ? a - c : m[2] === '×' ? a * c : a / c; assert.equal(e, r, `${ch.id}: ${m[0]}`); }
    if (s.v.t === 'bar' && s.v.total !== null && s.v.a !== null && s.v.b !== null) assert.equal(s.v.a + s.v.b, s.v.total, `${ch.id} bar parts`);
    if (s.v.t === 'line') { assert.ok(s.v.a >= 1 && s.v.a <= 20); const e = s.v.op === '+' ? s.v.a + s.v.b : s.v.a - s.v.b; assert.ok(e >= 0 && e <= 20, `${ch.id} line ${s.v.a}${s.v.op}${s.v.b}`); }
    if (s.v.t === 'blocks') assert.ok(s.v.a >= 0 && s.v.b >= 0 && (s.v.op === '+' ? s.v.a + s.v.b <= 10 : s.v.b <= s.v.a && s.v.a <= 10), `${ch.id} blocks`);
    if (s.v.t === 'array') assert.ok(s.v.rows >= 1 && s.v.rows <= 10 && s.v.cols >= 1 && s.v.cols <= 10);
    if (s.v.t === 'frame') assert.ok(s.v.filled + (s.v.extra ?? 0) <= 10, `${ch.id} frame`);
    if (s.v.t === 'objects') for (const p of s.v.parts) assert.ok(p.n >= 0 && p.n <= 20, `${ch.id} objects`);
  }
  for (let base = 1; base < 60; base++) {
    const q = chapterQuestions(ch, base); assert.equal(q.length, QUESTIONS_PER_CHAPTER, `${ch.id} ten questions`);
    assert.deepEqual(chapterQuestions(ch, base).map(i => i.p.id), q.map(i => i.p.id), 'deterministic');
    let last = -1e9;
    for (const it of q) {
      if (it.kind === 'num') {
        const p = it.p; const d = difficulty(p); assert.ok(d >= last - 1e-9, `${ch.id} progression`); last = d;
        const m = p.prompt.match(/^(\d+) ([+\-x\/]) (\d+) = \?$/);
        if (m) { const a = +m[1], c = +m[3]; const e = m[2] === '+' ? a + c : m[2] === '-' ? a - c : m[2] === 'x' ? a * c : a / c; assert.equal(e, p.answer, p.prompt); if (ch.opts?.sumMax) assert.ok(a + c <= ch.opts.sumMax, `${ch.id} sum within ${ch.opts.sumMax}: ${p.prompt}`); if (ch.kind === 'subtract' && ch.opts?.max) assert.ok(a <= ch.opts.max); if (ch.opts?.factors && (ch.kind === 'multiply')) assert.ok(ch.opts.factors.includes(c), `${ch.id} factor ${p.prompt}`); }
        const mm = p.prompt.match(/^(\d+) \+ \? = (\d+)$/); if (mm && ch.opts?.total) assert.equal(+mm[2], ch.opts.total);
        assert.ok(p.choices.includes(p.answer) && new Set(p.choices).size === 4);
      } else if (it.kind === 'meas') { assert.ok(it.p.level >= last - 1e-9, `${ch.id} meas progression`); last = it.p.level; assert.ok(it.p.choices.includes(it.p.answer)); if (ch.m?.maxTotal && it.p.coins) assert.ok(it.p.coins.reduce((a, b) => a + b, 0) <= ch.m.maxTotal, `${ch.id} total cap`);
      } else if (it.kind === 'pic') { const d = pictureDifficulty(it.p); assert.ok(d >= last - 1e-9, `${ch.id} pic progression`); last = d; assert.ok(it.p.choices.includes(it.p.answer)); }
    }
  }
}
console.log(`ALL PASS (${chapters} chapters, ${steps} tutorial steps)`);

// Parent-chosen set length: 5, 10 or 15 questions, always the right count, easy to harder, mastery 80%.
import { SET_LENGTHS, masteryFor } from './chapters.ts';
for (const len of SET_LENGTHS) for (const b of BANDS) for (const ch of CHAPTERS[b]) {
  const q = chapterQuestions(ch, 7, len); assert.equal(q.length, len, `${ch.id} ${len} questions`);
}
assert.deepEqual(SET_LENGTHS.map(masteryFor), [4, 8, 12]);
console.log('set length tests pass');
