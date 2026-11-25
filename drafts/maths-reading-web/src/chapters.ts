// Chapters: a short tutorial first (worked example), then 10 questions that start easy and get harder.
// Teaching ideas used (our own wording, no method names on screen): concrete objects, then pictures
// (ten-frames, number lines, bar models, arrays), then numbers; small steps; repeat until secure.
import { makePuzzle, type AgeBand, type Kind, type Opts } from './maths.ts';
import { difficulty, pictureDifficulty } from './progression.ts';
import { makePicturePuzzle, type PicKind } from './picture.ts';
import { makeFrame, type Item } from './games.ts';
import { makeMeas, MKINDS, money, timeStr, COIN_NAME, type MKind, type MOpts } from './measure.ts';

export type ChKind = Kind | PicKind | 'frame' | MKind;
export interface Chapter { id: string; band: AgeBand; title: string; kind: ChKind; opts?: Opts; ex: number[]; m?: MOpts }
export const isMeas = (k: ChKind): k is MKind => (MKINDS as string[]).includes(k);
export const QUESTIONS_PER_CHAPTER = 10;
export const masteryFor = (n: number) => Math.ceil(n * 0.8);
export const SET_LENGTHS = [5, 10, 15];
export const MASTERY = 8; // right first time, out of 10, to move on; otherwise look again and try 10 more (no penalty)

const C = (band: AgeBand, n: number, title: string, kind: ChKind, ex: number[], opts?: Opts, m?: MOpts): Chapter => ({ id: `${band}:${n}`, band, title, kind, ex, opts, m });
export const CHAPTERS: Record<AgeBand, Chapter[]> = {
  '3-4': [C('3-4', 1, 'Counting', 'count', [3]), C('3-4', 2, 'One more', 'onemore', [3]), C('3-4', 3, 'Which has more?', 'more', [2, 4]), C('3-4', 4, 'Odd one out', 'odd', [4]), C('3-4', 5, 'Fill the frame', 'frame', [4])],
  '5-6': [C('5-6', 0, 'Seeing 5 and 10 in blocks', 'missing', [2, 3], { total: 5 }), C('5-6', 1, 'Adding up to 5', 'add', [2, 3], { sumMax: 5 }), C('5-6', 2, 'Adding up to 10', 'add', [4, 5], { sumMax: 10 }), C('5-6', 3, 'Taking away within 10', 'subtract', [8, 3], { max: 10 }),
    C('5-6', 4, 'Make 10', 'missing', [7, 3], { total: 10 }), C('5-6', 5, 'Adding up to 20', 'add', [8, 5], { sumMax: 20 }), C('5-6', 6, 'Taking away within 20', 'subtract', [13, 5], { max: 20 }),
    C('5-6', 7, 'Bigger or smaller', 'compare', [7, 12], { max: 20 }), C('5-6', 8, 'Adding three numbers', 'three', [3, 4, 2]), C('5-6', 9, 'Put in order', 'order', [9, 4, 15], { max: 20 })],
  '7-8': [C('7-8', 1, 'Adding up to 100', 'add', [34, 25], { sumMax: 100 }), C('7-8', 2, 'Taking away within 100', 'subtract', [64, 27], { max: 100 }), C('7-8', 3, 'Groups of 2, 5 and 10', 'multiply', [5, 4], { factors: [2, 5, 10], lim: 10 }),
    C('7-8', 4, 'Groups of 3 and 4', 'multiply', [6, 4], { factors: [3, 4], lim: 10 }), C('7-8', 5, 'Sharing equally', 'divide', [4, 3], { factors: [2, 3, 4, 5, 10], lim: 10 }), C('7-8', 6, 'Missing numbers', 'missing', [23, 15], { max: 50 })],
  '9-10': [C('9-10', 1, 'Adding up to 1000', 'add', [345, 278], { sumMax: 1000 }), C('9-10', 2, 'Taking away within 1000', 'subtract', [503, 287], { max: 1000 }), C('9-10', 3, 'Times tables to 12', 'multiply', [6, 7], { lim: 12 }),
    C('9-10', 4, 'Sharing and dividing', 'divide', [7, 6], { lim: 12 }), C('9-10', 5, 'Missing numbers', 'missing', [120, 85], { max: 500 }), C('9-10', 6, 'Put in order', 'order', [408, 84, 840], { max: 1000 })],
  '11-12': [C('11-12', 1, 'Adding big numbers', 'add', [4376, 2958], { sumMax: 10000 }), C('11-12', 2, 'Taking away big numbers', 'subtract', [8005, 3478], { max: 10000 }), C('11-12', 3, 'Multiplying bigger numbers', 'multiply', [14, 12], { lim: 25 }),
    C('11-12', 4, 'Dividing bigger numbers', 'divide', [12, 15], { lim: 25 }), C('11-12', 5, 'Missing numbers', 'missing', [1250, 830], { max: 5000 }), C('11-12', 6, 'Put in order', 'order', [4080, 840, 8400], { max: 10000 })],
};

// Money and clocks (maths, measurement). Added after the number chapters so earlier progress still lines up.
const M = (band: AgeBand, title: string, kind: MKind, ex: number[], m?: MOpts) => { CHAPTERS[band].push(C(band, CHAPTERS[band].length, title, kind, ex, undefined, m)); };
M('5-6', 'Coins: penny, nickel, dime, quarter', 'coinvalue', [1, 5, 10, 25], { coins: [1, 5, 10, 25] });
M('5-6', 'Counting pennies and dimes', 'coincount', [10, 10, 1, 1], { coins: [1, 10], n: [2, 5], maxTotal: 60 });
M('5-6', "Clock: o'clock", 'clock', [3, 0], { step: 60 });
M('5-6', 'Clock: half past', 'clock', [3, 30], { step: 30 });
M('7-8', 'Counting coins', 'coincount', [25, 10, 5, 1], { coins: [1, 5, 10, 25], n: [3, 6], maxTotal: 99 });
M('7-8', 'Dollar notes: $1, $5, $10', 'billcount', [500, 100, 100], { bills: [100, 500, 1000], n: [2, 4], maxTotal: 3000 });
M('7-8', 'Clock: quarter past and quarter to', 'clock', [4, 15], { step: 15 });
M('7-8', 'Clock: five minutes at a time', 'clock', [4, 35], { step: 5 });
M('9-10', 'Dollars and cents: notes', 'billcount', [1000, 500, 100], { bills: [100, 500, 1000, 2000], n: [3, 5], maxTotal: 8000 });
M('9-10', 'Making change', 'change', [320, 500], { maxPrice: 4 });
M('9-10', 'Clock: any minute', 'clock', [7, 24], { step: 1 });
M('11-12', 'Making change (bigger)', 'change', [1255, 2000], { maxPrice: 17 });
M('11-12', 'Clock: any minute', 'clock', [7, 24], { step: 1 });
M('11-12', 'How long will it take?', 'elapsed', [2, 15, 50], {});

function spread<T>(sorted: T[], count: number): T[] { return Array.from({ length: count }, (_, i) => sorted[Math.round((i * (sorted.length - 1)) / (count - 1))]); }
// 10 questions for a chapter, easy to harder. Same base gives the same ten.
export function chapterQuestions(ch: Chapter, base: number, n: number = QUESTIONS_PER_CHAPTER): Item[] {
  if (isMeas(ch.kind)) {
    const seen = new Set<string>(); const pool = [] as ReturnType<typeof makeMeas>[];
    for (let i = 0; i < 2000 && pool.length < 40; i++) { const kinds: MKind[] = ch.kind === 'coinvalue' ? ['coinvalue', 'coinname', 'coinmore'] : [ch.kind as MKind]; const p = makeMeas(kinds[i % kinds.length], base * 1000 + i, ch.m); const k = p.kind + p.speak + JSON.stringify([p.coins, p.bills, p.clock]); if (!seen.has(k)) { seen.add(k); pool.push(p); } }
    pool.sort((a, b) => a.level - b.level || (a.id < b.id ? -1 : 1));
    return spread(pool, n).map(p => ({ kind: 'meas' as const, p }));
  }
  if (ch.kind === 'frame') { const fs = Array.from({ length: 40 }, (_, i) => makeFrame(ch.band, base * 100 + i)).sort((a, b) => a.n - b.n); return spread(fs, n).map(p => ({ kind: 'frame' as const, p })); }
  if (ch.band === '3-4') {
    const seen = new Set<string>(); const pool = [] as ReturnType<typeof makePicturePuzzle>[];
    for (let i = 0; i < 400 && pool.length < 60; i++) { const p = makePicturePuzzle(ch.kind as PicKind, base * 1000 + i); const k = JSON.stringify(p.groups) + (p.kind === 'odd' ? p.answer : ''); if (!seen.has(k)) { seen.add(k); pool.push(p); } }
    pool.sort((a, b) => pictureDifficulty(a) - pictureDifficulty(b) || (a.id < b.id ? -1 : 1));
    return spread(pool, n).map(p => ({ kind: 'pic' as const, p }));
  }
  const seen = new Set<string>(); const pool = [] as ReturnType<typeof makePuzzle>[];
  for (let i = 0; i < 2000 && pool.length < 80; i++) { const p = makePuzzle(ch.band, ch.kind as Kind, base * 1000 + i, ch.opts); if (!seen.has(p.prompt)) { seen.add(p.prompt); pool.push(p); } }
  pool.sort((a, b) => difficulty(a) - difficulty(b) || (a.id < b.id ? -1 : 1));
  return spread(pool, n).map(p => ({ kind: 'num' as const, p }));
}

// ---------- tutorials ----------
export type V =
  | { t: 'objects'; parts: { n: number; color: string; shape: string; crossed?: number }[]; sign?: string; tap?: boolean }
  | { t: 'frame'; filled: number; extra?: number }
  | { t: 'blocks'; a: number; b: number; op: '+' | '-' }
  | { t: 'line'; a: number; b: number; op: '+' | '-' }
  | { t: 'bar'; total: number | null; a: number | null; b: number | null }
  | { t: 'array'; rows: number; cols: number }
  | { t: 'bars'; a: number; b: number }
  | { t: 'text'; big: string }
  | { t: 'money'; coins?: number[]; bills?: number[]; tag?: number; hide?: boolean }
  | { t: 'clock'; h: number; m: number; pointer?: 'hour' | 'minute' }
  | { t: 'none' };
export interface Step { say: string; v: V }
const place = (x: number) => { const out: number[] = []; let m = 1; let y = x; while (y > 0) { const d = y % 10; if (d) out.unshift(d * m); y = Math.floor(y / 10); m *= 10; } return out; };
const sum = (xs: number[]) => xs.reduce((p, q) => p + q, 0);
// Pattern words for the block grid (2 columns of 5): a full column is 5, two full columns are 10.
export const pattern = (n: number) => n === 0 ? 'no blocks' : n < 5 ? `${5 - n} short of a full column` : n === 5 ? 'one full column, 5' : n < 10 ? `a full column and ${n - 5} more` : 'two full columns, 10';
const start: Step = { say: 'Your turn now! You will get ten questions. They start easy and get a little harder.', v: { t: 'none' } };

const cn = (c: number) => `a ${COIN_NAME[c]}`;
function measSteps(ch: Chapter): Step[] {
  const [x, y, z] = ch.ex; const k = ch.kind as MKind; const s: Step[] = [];
  if (k === 'coinvalue' || k === 'coinname' || k === 'coinmore') {
    s.push({ say: 'A penny is worth 1 cent. It is small and copper-coloured.', v: { t: 'money', coins: [1] } }, { say: 'A nickel is worth 5 cents. It is bigger than a penny.', v: { t: 'money', coins: [5] } },
      { say: 'A dime is worth 10 cents. It is the smallest silver coin, but it is worth more than a nickel!', v: { t: 'money', coins: [10] } }, { say: 'A quarter is worth 25 cents. It is the biggest coin here.', v: { t: 'money', coins: [25] } },
      { say: 'Size does not tell you the value. Look at the number on the coin.', v: { t: 'money', coins: [1, 5, 10, 25] } });
  } else if (k === 'coincount') {
    const cs = ch.ex.slice().sort((p, q) => q - p); s.push({ say: `Count coins from the biggest to the smallest. Here are ${cs.length} coins.`, v: { t: 'money', coins: cs } });
    let run = 0; for (let i = 0; i < cs.length; i++) { run += cs[i]; s.push({ say: i === 0 ? `Start with ${cn(cs[0])}: ${money(run)}.` : `Add ${cn(cs[i])} (${cs[i]}¢): ${money(run)}.`, v: { t: 'money', coins: cs.slice(0, i + 1) } }); }
    s.push({ say: `Altogether: ${money(run)}.`, v: { t: 'text', big: money(run) } });
  } else if (k === 'billcount') {
    const bs = ch.ex.slice().sort((p, q) => q - p); s.push({ say: 'These are play notes. Count from the biggest to the smallest.', v: { t: 'money', bills: bs } }); let run = 0;
    for (let i = 0; i < bs.length; i++) { run += bs[i]; s.push({ say: `${i === 0 ? 'Start with' : 'Add'} ${money(bs[i])}: ${money(run)}.`, v: { t: 'money', bills: bs.slice(0, i + 1) } }); }
    s.push({ say: `Altogether: ${money(run)}.`, v: { t: 'text', big: money(run) } });
  } else if (k === 'change') {
    const price = x, pay = y; const up = Math.ceil(price / 100) * 100; const a = up - price, b = pay - up;
    s.push({ say: `Something costs ${money(price)}. You pay with ${money(pay)}. Change is what you get back.`, v: { t: 'money', tag: price, bills: [pay] } },
      ...(a > 0 ? [{ say: `Count up from ${money(price)} to the next dollar: ${money(a)} more makes ${money(up)}.`, v: { t: 'text' as const, big: `${money(price)} + ${money(a)} = ${money(up)}` } }] : []),
      { say: `Then count up from ${money(up)} to ${money(pay)}: ${money(b)} more.`, v: { t: 'text', big: `${money(up)} + ${money(b)} = ${money(pay)}` } },
      { say: `Add the two jumps: ${money(a)} + ${money(b)} = ${money(a + b)}. That is your change.`, v: { t: 'text', big: money(pay - price) } });
  } else if (k === 'clock') {
    const step = ch.m?.step ?? 60;
    s.push({ say: 'A clock has two hands. The short hand shows the hour. The long hand shows the minutes.', v: { t: 'clock', h: 3, m: 0 } });
    if (step === 60) s.push({ say: "When the long hand points straight up at 12, it is an o'clock time. The short hand points at 3, so it is 3 o'clock.", v: { t: 'clock', h: 3, m: 0 } }, { say: "Here the short hand points at 7 and the long hand at 12: 7 o'clock.", v: { t: 'clock', h: 7, m: 0 } });
    else if (step === 30) s.push({ say: 'When the long hand points straight down at 6, it is half past. The short hand is between two numbers. Here it is half past 3.', v: { t: 'clock', h: 3, m: 30 } }, { say: 'Half past 8 is written 8:30.', v: { t: 'clock', h: 8, m: 30 } });
    else if (step === 15) s.push({ say: 'Long hand on 3: quarter past. It is 15 minutes after the hour. Here, quarter past 4 (4:15).', v: { t: 'clock', h: 4, m: 15 } }, { say: 'Long hand on 9: quarter to the next hour. It is 15 minutes before. Here, quarter to 5 (4:45).', v: { t: 'clock', h: 4, m: 45 } });
    else if (step === 5) s.push({ say: 'Each number on the clock is 5 minutes. Count by fives: 5, 10, 15, 20, 25, 30, 35.', v: { t: 'clock', h: 4, m: 35 } }, { say: 'The long hand is on 7. That is 35 minutes. The short hand is just past 4. So it is 4:35.', v: { t: 'text', big: '4:35' } });
    else s.push({ say: 'Count by fives to the number, then count the little lines one by one. Here the long hand is on 4 (20 minutes) plus 4 more lines.', v: { t: 'clock', h: 7, m: 24 } }, { say: 'The short hand is just past 7. So it is 7:24.', v: { t: 'text', big: '7:24' } });
  } else { // elapsed
    const [h, m, dur] = ch.ex; const end = m + dur;
    s.push({ say: `A film starts at ${timeStr(h, m)} and lasts ${dur} minutes.`, v: { t: 'clock', h, m } }, { say: `Count on in chunks. First go to the next hour: ${60 - m} minutes gets you to ${timeStr(h + 1, 0)}.`, v: { t: 'text', big: `${timeStr(h, m)} + ${60 - m} min = ${timeStr(h + 1, 0)}` } },
      { say: `${dur} − ${60 - m} = ${dur - (60 - m)} minutes left. Add them on.`, v: { t: 'text', big: `${timeStr(h + 1, 0)} + ${dur - (60 - m)} min = ${timeStr(h + Math.floor(end / 60), end % 60)}` } },
      { say: `The film ends at ${timeStr(h + Math.floor(end / 60), end % 60)}.`, v: { t: 'clock', h: h + Math.floor(end / 60), m: end % 60 } });
  }
  void z; return s;
}
export function tutorialFor(ch: Chapter): Step[] {
  const [x, y, z] = ch.ex; const k = ch.kind; const small = (n: number) => n <= 20;
  const st: Step[] = [{ say: `Let us learn: ${ch.title.replace(/[.?!]+$/, '')}.`, v: { t: 'none' } }];
  if (isMeas(k)) { st.push(...measSteps(ch)); st.push(start); return st; }
  if (k === 'count') { st.push({ say: `Here are ${x} red circles. Touch each one and count out loud.`, v: { t: 'objects', parts: [{ n: x, color: 'red', shape: 'circle' }], tap: true } }, { say: `The last number you say is how many. There are ${x}.`, v: { t: 'text', big: String(x) } }); }
  else if (k === 'onemore') { st.push({ say: `Here are ${x} blue stars.`, v: { t: 'objects', parts: [{ n: x, color: 'blue', shape: 'star' }] } }, { say: `Add one more star. Now there are ${x + 1}.`, v: { t: 'objects', parts: [{ n: x, color: 'blue', shape: 'star' }, { n: 1, color: 'orange', shape: 'star' }], sign: '+' } }, { say: `One more than ${x} is ${x + 1}.`, v: { t: 'text', big: `${x} + 1 = ${x + 1}` } }); }
  else if (k === 'more') { st.push({ say: `Here are two groups. The first group has ${x}. The second group has ${y}.`, v: { t: 'objects', parts: [{ n: x, color: 'green', shape: 'square' }, { n: y, color: 'purple', shape: 'square' }], sign: '|' } }, { say: `${y} is more than ${x}, so the second group has more.`, v: { t: 'bars', a: x, b: y } }); }
  else if (k === 'odd') { st.push({ say: 'Look at the shapes. Most are triangles. One is a star. The star is different.', v: { t: 'objects', parts: [{ n: x - 1, color: 'blue', shape: 'triangle' }, { n: 1, color: 'blue', shape: 'star' }] } }); }
  else if (k === 'frame') { st.push({ say: `A frame holds up to ten circles. Let us fill ${x}.`, v: { t: 'frame', filled: x } }, { say: `Count the filled circles: ${Array.from({ length: x }, (_, i) => i + 1).join(', ')}. That is ${x}.`, v: { t: 'frame', filled: x } }); }
  else if (k === 'add' && !small(x + y)) {
    const px = place(x), py = place(y); const parts = [...px, ...py]; const names = ['ones', 'tens', 'hundreds', 'thousands'];
    st.push({ say: `We will add ${x} + ${y}. Big numbers are easier in small chunks.`, v: { t: 'bar', total: null, a: x, b: y } }, { say: `Break ${y} into ${py.join(' + ')}. Add one chunk at a time to ${x}.`, v: { t: 'text', big: `${y} = ${py.join(' + ')}` } });
    let run = x; for (const p of py) { st.push({ say: `${run} + ${p} = ${run + p}`, v: { t: 'text', big: `${run} + ${p} = ${run + p}` } }); run += p; }
    st.push({ say: `So ${x} + ${y} = ${x + y}.`, v: { t: 'bar', total: x + y, a: x, b: y } }); void names; void parts;
  }
  else if (k === 'add') {
    const col = 'red', col2 = 'blue';
    if (x + y <= 10 || x + y <= 5) {
      st.push({ say: `${x} red apples.`, v: { t: 'objects', parts: [{ n: x, color: col, shape: 'circle' }] } }, { say: `And ${y} more blue apples.`, v: { t: 'objects', parts: [{ n: x, color: col, shape: 'circle' }, { n: y, color: col2, shape: 'circle' }], sign: '+' } },
        { say: `Count them all: ${x + y}.`, v: { t: 'objects', parts: [{ n: x + y, color: 'orange', shape: 'circle' }], tap: true } }, { say: `Put them in a frame to see the whole.`, v: { t: 'frame', filled: x, extra: y } },
        { say: `Now as blocks. A full column is 5, two full columns are 10. ${x} + ${y} = ${x + y}: ${pattern(x + y)}.`, v: { t: 'blocks', a: x, b: y, op: '+' } },
        { say: `Two parts, ${x} and ${y}, make a whole of ${x + y}.`, v: { t: 'bar', total: x + y, a: x, b: y } }, { say: `Now with numbers: ${x} + ${y} = ${x + y}.`, v: { t: 'text', big: `${x} + ${y} = ${x + y}` } });
    } else {
      const toTen = 10 - x, rest = y - toTen;
      st.push({ say: `${x} + ${y}. Let us make ten first. ${x} needs ${toTen} more to reach 10.`, v: { t: 'frame', filled: x, extra: toTen } }, { say: `Split ${y} into ${toTen} and ${rest}.`, v: { t: 'bar', total: y, a: toTen, b: rest } },
        { say: `${x} + ${toTen} = 10, then 10 + ${rest} = ${x + y}.`, v: { t: 'text', big: `${x} + ${toTen} = 10, 10 + ${rest} = ${x + y}` } }, { say: `So ${x} + ${y} = ${x + y}.`, v: { t: 'line', a: x, b: y, op: '+' } });
    }
  }
  else if (k === 'subtract' && !small(x)) {
    const py = place(y); let run = x;
    st.push({ say: `We will take away: ${x} − ${y}. Take away in small chunks.`, v: { t: 'bar', total: x, a: null, b: y } }, { say: `Break ${y} into ${py.join(' + ')}.`, v: { t: 'text', big: `${y} = ${py.join(' + ')}` } });
    for (const p of py) { st.push({ say: `${run} − ${p} = ${run - p}`, v: { t: 'text', big: `${run} − ${p} = ${run - p}` } }); run -= p; }
    st.push({ say: `So ${x} − ${y} = ${x - y}.`, v: { t: 'bar', total: x, a: x - y, b: y } });
  }
  else if (k === 'subtract') {
    if (x <= 10) st.push({ say: `${x} apples. Take away ${y}.`, v: { t: 'objects', parts: [{ n: x, color: 'red', shape: 'circle', crossed: y }] } }, { say: `As blocks: ${x} is ${pattern(x)}. Take away ${y}, and ${x - y} are left: ${pattern(x - y)}.`, v: { t: 'blocks', a: x, b: y, op: '-' } }, { say: `Count what is left: ${x - y}.`, v: { t: 'objects', parts: [{ n: x - y, color: 'red', shape: 'circle' }], tap: true } }, { say: `The whole is ${x}. One part is ${y}. The other part is ${x - y}.`, v: { t: 'bar', total: x, a: x - y, b: y } }, { say: `${x} − ${y} = ${x - y}.`, v: { t: 'text', big: `${x} − ${y} = ${x - y}` } });
    else { const toTen = x - 10, rest = y - toTen; st.push({ say: `${x} − ${y}. Go back to ten first: ${x} − ${toTen} = 10.`, v: { t: 'line', a: x, b: toTen, op: '-' } }, { say: `Now take away the rest: ${rest}. 10 − ${rest} = ${10 - rest}.`, v: { t: 'line', a: 10, b: rest, op: '-' } }, { say: `So ${x} − ${y} = ${x - y}.`, v: { t: 'text', big: `${x} − ${y} = ${x - y}` } }); }
  }
  else if (k === 'missing') {
    const total = ch.opts?.total ?? x + y;
    st.push({ say: `${x} + ? = ${total}. The whole is ${total}. One part is ${x}. What is the other part?`, v: { t: 'bar', total, a: x, b: null } }, ...(total <= 10 ? [{ say: `As blocks: ${x} filled, and ${total - x} more to fill. ${total} is ${pattern(total)}.`, v: { t: 'blocks' as const, a: x, b: total - x, op: '+' as const } }] : []), { say: `Take the part you know away from the whole: ${total} − ${x} = ${total - x}.`, v: { t: 'text', big: `${total} − ${x} = ${total - x}` } }, { say: `Check: ${x} + ${total - x} = ${total}.`, v: { t: 'bar', total, a: x, b: total - x } });
  }
  else if (k === 'multiply') {
    if (x <= 10 && y <= 10) st.push({ say: `${x} rows with ${y} in each row. That is ${x} groups of ${y}.`, v: { t: 'array', rows: x, cols: y } }, { say: `Add the groups: ${Array.from({ length: x }, () => y).join(' + ')} = ${x * y}.`, v: { t: 'text', big: `${Array.from({ length: x }, () => y).join(' + ')} = ${x * y}` } }, { say: `We write it as ${x} × ${y} = ${x * y}.`, v: { t: 'text', big: `${x} × ${y} = ${x * y}` } });
    else { const py = place(y); st.push({ say: `${x} × ${y}. Split ${y} into ${py.join(' + ')}.`, v: { t: 'text', big: `${y} = ${py.join(' + ')}` } }); for (const p of py) st.push({ say: `${x} × ${p} = ${x * p}`, v: { t: 'text', big: `${x} × ${p} = ${x * p}` } }); st.push({ say: `Add the answers: ${py.map(p => x * p).join(' + ')} = ${x * y}.`, v: { t: 'text', big: `${x} × ${y} = ${x * y}` } }); }
  }
  else if (k === 'divide') {
    const q = y, d = x; // x = number of groups, y = size of each group
    if (d <= 10 && q <= 10) st.push({ say: `Share ${d * q} equally into ${d} groups.`, v: { t: 'array', rows: d, cols: q } }, { say: `Each group gets ${q}. So ${d * q} ÷ ${d} = ${q}.`, v: { t: 'text', big: `${d * q} ÷ ${d} = ${q}` } }, { say: `Check by multiplying: ${d} × ${q} = ${d * q}.`, v: { t: 'text', big: `${d} × ${q} = ${d * q}` } });
    else st.push({ say: `${d * q} ÷ ${d}: what number times ${d} makes ${d * q}?`, v: { t: 'text', big: `${d} × ? = ${d * q}` } }, { say: `${d} × ${q} = ${d * q}, so ${d * q} ÷ ${d} = ${q}.`, v: { t: 'text', big: `${d * q} ÷ ${d} = ${q}` } });
  }
  else if (k === 'compare') { st.push({ say: `Which is bigger, ${x} or ${y}? Longer bars mean bigger numbers.`, v: { t: 'bars', a: x, b: y } }, { say: `${Math.max(x, y)} is bigger than ${Math.min(x, y)}.`, v: { t: 'text', big: `${Math.max(x, y)} > ${Math.min(x, y)}` } }); }
  else if (k === 'three') { st.push({ say: `Add three numbers: ${x} + ${y} + ${z}. Add the first two, then add the last.`, v: { t: 'objects', parts: [{ n: x, color: 'red', shape: 'circle' }, { n: y, color: 'blue', shape: 'circle' }, { n: z!, color: 'green', shape: 'circle' }], sign: '+' } }, { say: `${x} + ${y} = ${x + y}.`, v: { t: 'text', big: `${x} + ${y} = ${x + y}` } }, { say: `${x + y} + ${z} = ${x + y + z!}.`, v: { t: 'text', big: `${x + y} + ${z} = ${x + y + z!}` } }); }
  else if (k === 'order') { const s = [...ch.ex].sort((p, q) => p - q); st.push({ say: `Put the numbers ${ch.ex.join(', ')} in order from smallest to biggest.`, v: { t: 'text', big: ch.ex.join('   ') } }, { say: `Smallest is ${s[0]}. Biggest is ${s[2]}. In order: ${s.join(', ')}.`, v: { t: 'text', big: s.join(' < ') } }); }
  st.push(start); return st;
}
