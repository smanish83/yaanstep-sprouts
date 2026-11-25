import assert from 'node:assert';
import { MKINDS, makeMeas, money, timeStr, COIN_NAME } from './measure.ts';
const opts: Record<string, any> = { coincount: { coins: [1, 5, 10, 25], n: [2, 6], maxTotal: 99 }, billcount: { bills: [100, 500, 1000, 2000], n: [2, 4], maxTotal: 5000 }, change: { maxPrice: 9 }, clock: { step: 1 }, coinmore: {}, coinvalue: {}, coinname: {}, elapsed: {} };
for (const k of MKINDS) for (let s = 1; s <= 3000; s++) {
  const p = makeMeas(k, s, opts[k]);
  assert.ok(p.choices.includes(p.answer), `${k} ${s} answer in choices`); assert.equal(new Set(p.choices).size, p.choices.length, `${k} ${s} unique`);
  assert.ok(p.choices.length === (k === 'coinmore' ? 2 : 4), `${k} ${s} choices ${p.choices.length}`);
  assert.deepEqual(makeMeas(k, s, opts[k]), p, 'deterministic');
  if (k === 'coincount') { assert.equal(money(p.coins!.reduce((a, b) => a + b, 0)), p.answer); assert.ok(p.coins!.reduce((a, b) => a + b, 0) <= 99); }
  if (k === 'billcount') assert.equal(money(p.bills!.reduce((a, b) => a + b, 0)), p.answer);
  if (k === 'coinvalue') assert.equal(money(p.coins![0]), p.answer);
  if (k === 'coinname') assert.equal(COIN_NAME[p.coins![0]], p.answer);
  if (k === 'coinmore') assert.equal(COIN_NAME[Math.max(...p.coins!)], p.answer);
  if (k === 'change') { const m = p.speak.match(/pay (\S+) for something that costs (\S+)\./)!; const toC = (x: string) => x.endsWith('¢') ? parseInt(x) : Math.round(parseFloat(x.slice(1)) * 100); assert.equal(money(toC(m[1]) - toC(m[2])), p.answer); assert.ok(toC(m[1]) > toC(m[2])); }
  if (k === 'clock') { assert.equal(timeStr(p.clock!.h, p.clock!.m), p.answer); assert.ok(p.clock!.m >= 0 && p.clock!.m < 60); }
  if (k === 'elapsed') { const m = p.speak.match(/starts at (\d+):(\d+) and lasts (\d+) minutes/)!; const t = (+m[1] % 12) * 60 + +m[2] + +m[3]; assert.equal(timeStr(Math.floor(t / 60), t % 60), p.answer); }
}
for (const step of [60, 30, 15, 5]) for (let s = 1; s < 500; s++) { const p = makeMeas('clock', s, { step }); assert.equal(p.clock!.m % step === 0 || step === 60 && p.clock!.m === 0, true, `step ${step} minute ${p.clock!.m}`); }
console.log('ALL PASS (money and clock)');
