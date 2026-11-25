// Money and clock puzzles (maths, measurement). Generated from a seed, nothing stored.
// Coins and notes are drawn as simple play money: no portraits, no real designs.
import { rng } from './maths.ts';
export type MKind = 'coinvalue' | 'coinname' | 'coinmore' | 'coincount' | 'billcount' | 'change' | 'clock' | 'elapsed';
export const MKINDS: MKind[] = ['coinvalue', 'coinname', 'coinmore', 'coincount', 'billcount', 'change', 'clock', 'elapsed'];
export interface MOpts { coins?: number[]; n?: [number, number]; maxTotal?: number; step?: number; bills?: number[]; maxPrice?: number }
export interface MeasPuzzle { id: string; kind: MKind; level: number; speak: string; alt: string; answer: string; choices: string[]; coins?: number[]; bills?: number[]; clock?: { h: number; m: number }; tag?: number }
export const COIN_NAME: Record<number, string> = { 1: 'penny', 5: 'nickel', 10: 'dime', 25: 'quarter' };
export const money = (c: number) => c < 100 ? `${c}¢` : c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`;
export const timeStr = (h: number, m: number) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
function shuffle<T>(r: () => number, a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function pickChoices(r: () => number, answer: string, cands: string[], total = 4): string[] {
  const uniq = [...new Set(cands.filter(c => c !== answer))]; const out = [answer, ...shuffle(r, uniq).slice(0, total - 1)]; return shuffle(r, out);
}
export function clockLevel(h: number, m: number): number { return (m === 0 ? 0 : m === 30 ? 1 : m % 15 === 0 ? 2 : m % 5 === 0 ? 3 : 4) * 20 + h; }

export function makeMeas(kind: MKind, seed: number, o: MOpts = {}): MeasPuzzle {
  const r = rng(seed * 17 + MKINDS.indexOf(kind) * 5 + 3); const id = `${kind}-${seed}`;
  const allCoins = o.coins ?? [1, 5, 10, 25];
  if (kind === 'coinvalue') { const c = allCoins[int(r, 0, allCoins.length - 1)]; const ans = money(c);
    return { id, kind, level: [1, 5, 10, 25].indexOf(c), speak: 'How much is this coin worth?', alt: `A ${COIN_NAME[c]}`, answer: ans, choices: [1, 5, 10, 25].map(money), coins: [c] }; }
  if (kind === 'coinname') { const c = allCoins[int(r, 0, allCoins.length - 1)];
    return { id, kind, level: [1, 5, 10, 25].indexOf(c), speak: 'What is this coin called?', alt: `A coin worth ${money(c)}`, answer: COIN_NAME[c], choices: ['penny', 'nickel', 'dime', 'quarter'], coins: [c] }; }
  if (kind === 'coinmore') { const a = allCoins[int(r, 0, allCoins.length - 1)]; let b = a; while (b === a) b = allCoins[int(r, 0, allCoins.length - 1)];
    const hi = Math.max(a, b), lo = Math.min(a, b);
    return { id, kind, level: Math.round(100 / (hi - lo)), speak: 'Which coin is worth more?', alt: `A ${COIN_NAME[a]} and a ${COIN_NAME[b]}`, answer: COIN_NAME[hi], choices: shuffle(r, [COIN_NAME[a], COIN_NAME[b]]), coins: [a, b] }; }
  if (kind === 'coincount') {
    const [nlo, nhi] = o.n ?? [2, 5]; const max = o.maxTotal ?? 99; let coins: number[] = [], total = 0;
    for (let t = 0; t < 50; t++) { const n = int(r, nlo, nhi); coins = Array.from({ length: n }, () => allCoins[int(r, 0, allCoins.length - 1)]).sort((x, y) => y - x); total = coins.reduce((p, q) => p + q, 0); if (total <= max) break; if (t === 49) { coins = coins.slice(0, 2); total = coins[0] + coins[1]; } }
    const mn = Math.min(...allCoins); const ans = money(total);
    const cands = [total + mn, total - mn, total + 5, total - 5, total + 10, total - 10, coins.length, total + 1].filter(x => x > 0).map(money);
    return { id, kind, level: total / 100 + coins.length / 10, speak: 'How much money is this?', alt: `Coins: ${coins.map(c => COIN_NAME[c]).join(', ')}`, answer: ans, choices: pickChoices(r, ans, cands), coins }; }
  if (kind === 'billcount') {
    const bl = o.bills ?? [100, 500, 1000]; const [nlo, nhi] = o.n ?? [2, 4]; const max = o.maxTotal ?? 3000; let bills: number[] = [], total = 0;
    for (let t = 0; t < 50; t++) { const n = int(r, nlo, nhi); bills = Array.from({ length: n }, () => bl[int(r, 0, bl.length - 1)]).sort((x, y) => y - x); total = bills.reduce((p, q) => p + q, 0); if (total <= max) break; if (t === 49) { bills = [bl[0], bl[0]]; total = 2 * bl[0]; } }
    const ans = money(total); const cands = [total + 100, total - 100, total + 500, total - 500, total + 1000, total - 1000].filter(x => x > 0).map(money);
    return { id, kind, level: total / 100, speak: 'How much money is this?', alt: `Notes: ${bills.map(b => money(b)).join(', ')}`, answer: ans, choices: pickChoices(r, ans, cands), bills }; }
  if (kind === 'change') {
    const maxP = o.maxPrice ?? 4; const price = int(r, 1, maxP) * 100 + int(r, 0, 19) * 5 + (int(r, 0, 3) === 0 ? 0 : 0);
    const pay = [500, 1000, 2000].find(p => p > price)!; const ch = pay - price; const ans = money(ch);
    const cands = [ch + 5, ch - 5, ch + 10, ch - 10, ch + 100, ch - 100, price].filter(x => x > 0).map(money);
    return { id, kind, level: price, speak: `You pay ${money(pay)} for something that costs ${money(price)}. How much change do you get?`, alt: `Price tag ${money(price)}, paying with ${money(pay)}`, answer: ans, choices: pickChoices(r, ans, cands), tag: price, bills: [pay] }; }
  if (kind === 'clock') {
    const step = o.step ?? 60; const h = int(r, 1, 12); const m = int(r, 0, Math.floor(59 / step)) * (step === 60 ? 60 : step) % 60;
    const ans = timeStr(h, m); const c: string[] = [timeStr(h + 1, m), timeStr(h - 1 + 12, m), timeStr(h, (m + 30) % 60), timeStr(h, (m + 15) % 60), timeStr(h, (m + 5) % 60), timeStr(h, (m + 45) % 60)];
    if (m % 5 === 0 && m !== 0) c.push(timeStr(m / 5, (h % 12) * 5 % 60));
    if (step === 1) c.push(timeStr(h, (m + 1) % 60), timeStr(h, (m + 59) % 60), timeStr(h, (m + 10) % 60));
    return { id, kind, level: clockLevel(h, m), speak: 'What time is it?', alt: `Clock face showing ${ans}`, answer: ans, choices: pickChoices(r, ans, c), clock: { h, m } }; }
  // elapsed
  const h = int(r, 1, 12); const m = int(r, 0, 11) * 5; const dur = int(r, 1, 24) * 5; const tot = m + dur; const eh = h + Math.floor(tot / 60); const em = tot % 60; const ans = timeStr(eh, em);
  const c = [timeStr(eh, (em + 10) % 60), timeStr(eh, (em + 50) % 60), timeStr(eh + 1, em), timeStr(eh - 1 + 12, em), timeStr(h, em), timeStr(eh, (em + 5) % 60)];
  return { id, kind, level: dur, speak: `A film starts at ${timeStr(h, m)} and lasts ${dur} minutes. When does it end?`, alt: `Clock showing ${timeStr(h, m)}`, answer: ans, choices: pickChoices(r, ans, c), clock: { h, m } };
}
