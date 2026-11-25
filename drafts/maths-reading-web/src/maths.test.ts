import { BANDS, kindsFor, makePuzzle, countDistinct, dailyPuzzles } from './maths.ts';
let fail = 0; const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
for (const b of BANDS) for (const k of kindsFor(b)) for (let s = 0; s < 3000; s++) {
  const p = makePuzzle(b, k, s);
  ok(p.choices.length === 4 && new Set(p.choices).size === 4, `4 distinct choices ${p.id}`);
  ok(p.choices.includes(p.answer), `answer among choices ${p.id}`);
  ok(p.choices.every(c => c >= 0), `no negative choices ${p.id}`);
  const m = p.prompt.match(/^(\d+) ([+\-x\/]) (\d+) = \?$/);
  if (m) { const a = +m[1], c = +m[3]; const e = m[2] === '+' ? a + c : m[2] === '-' ? a - c : m[2] === 'x' ? a * c : a / c; ok(e === p.answer && Number.isInteger(e), `correct answer ${p.id} ${p.prompt}`); }
  const mm = p.prompt.match(/^(\d+) \+ \? = (\d+)$/); if (mm) ok(+mm[1] + p.answer === +mm[2], `missing ${p.id} ${p.prompt}`);
  const cm = p.prompt.match(/^Which is bigger: (\d+) or (\d+)\?$/); if (cm) ok(Math.max(+cm[1], +cm[2]) === p.answer && cm[1] !== cm[2] && p.choices.includes(+cm[1]) && p.choices.includes(+cm[2]), `compare ${p.id} ${p.prompt}`);
  const tm = p.prompt.match(/^(\d+) \+ (\d+) \+ (\d+) = \?$/); if (tm) ok(+tm[1] + +tm[2] + +tm[3] === p.answer, `three ${p.id}`);
  const om = p.prompt.match(/^Which is (smallest|biggest): (\d+), (\d+) or (\d+)\?$/); if (om) { const v = [+om[2], +om[3], +om[4]]; ok(new Set(v).size === 3 && p.answer === (om[1] === 'smallest' ? Math.min(...v) : Math.max(...v)) && v.every(x => p.choices.includes(x)), `order ${p.id} ${p.prompt}`); }
  ok(JSON.stringify(makePuzzle(b, k, s)) === JSON.stringify(p), `deterministic ${p.id}`);
}
for (const b of BANDS) console.log(b, 'distinct prompts from 3000 seeds per kind:', countDistinct(b, 3000));
ok(dailyPuzzles('7-8', 5).length === 5, 'daily set size');
console.log(fail === 0 ? 'ALL PASS' : `${fail} FAILURES`); process.exit(fail ? 1 : 0);
