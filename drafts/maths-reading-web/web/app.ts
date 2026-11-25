import { chooseVoice } from '../src/voice.ts';
import { BANDS, type AgeBand, type Puzzle } from '../src/maths.ts';
import { playList, hopPlan, type Item, type FramePuzzle } from '../src/games.ts';
import { type PicturePuzzle, type Group } from '../src/picture.ts';
import { newProgress, recordAnswer, type Progress } from '../src/points.ts';
import { DeviceStore } from '../src/storage.ts';
import { money as fmtMoney, type MeasPuzzle } from '../src/measure.ts';
import { pattern, CHAPTERS, chapterQuestions, tutorialFor, QUESTIONS_PER_CHAPTER, masteryFor, SET_LENGTHS, type Step, type V } from '../src/chapters.ts';

const $ = (id: string) => document.getElementById(id)!;
let mem: Record<string, string> = {};
const kv = (() => { try { localStorage.setItem('t', '1'); localStorage.removeItem('t'); return localStorage; } catch { return { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; } }; } })();
const store = new DeviceStore(kv as any);
const today = () => Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 86400000);
let band: AgeBand | null = null; let progress: Progress = newProgress();
let curMiss = false; let history: boolean[] = []; // last answers, true = right first time (no fixed set size)
let items: Item[] = []; let idx = 0; let tries = 0; let played = 0; let adv: ReturnType<typeof setTimeout> | null = null;
type Mode = 'free' | 'chapter'; let mode: Mode = 'free'; let chIdx = 0; let tut: Step[] = []; let ti = 0;
let chDone: Record<string, number> = (() => { try { return JSON.parse(kv.getItem('demo-ch') || '{}'); } catch { return {}; } })();
const saveCh = () => { try { kv.setItem('demo-ch', JSON.stringify(chDone)); } catch { /* keep in memory */ } };
let setLen = (() => { try { const v = +(kv.getItem('set-len') ?? ''); return SET_LENGTHS.includes(v) ? v : QUESTIONS_PER_CHAPTER; } catch { return QUESTIONS_PER_CHAPTER; } })();
const young = () => band === '3-4' || band === '5-6';
const curCh = () => CHAPTERS[band!][chIdx];
const bandText = () => `Ages ${band!.replace('-', ' to ')}`;
const whoText = () => mode === 'chapter' ? `${bandText()} · Chapter ${chIdx + 1} of ${CHAPTERS[band!].length}: ${curCh().title}` : `${bandText()} · Free play`;
const PRAISE = ['Good job!', 'Great work!', 'Well done!', 'Super!', 'Brilliant!'];

const HINTS: Record<string, string> = {
  add: 'Start at the first number and count up.', subtract: 'Start at the first number and count back.', multiply: 'Think of equal groups, like rows of dots.',
  divide: 'How many equal groups can you make?', missing: 'What do you add to the first number to reach the total?', compare: 'Which number comes later when you count?',
  three: 'Add the first two, then add the last one.', double: 'Double means two of the same number. Add the number to itself.', half: 'Half means share into two equal groups.', maketen: 'Make 10 first, then add what is left over.', balance: 'Both sides of the equals sign are worth the same. Work out one side first.', family: 'Numbers in a family go together. Use the facts you know.', place: 'Look at which place the digit is in: ones, tens, hundreds.', fraction: 'Share the amount into equal groups, then count the groups you need.', word: 'Read it again. What do you know? What do you need to find?', barword: 'Draw a bar for each person. The extra part is the difference.', order: 'Say the numbers in order from smallest to biggest.',
  frame: 'Tap a circle to fill it. Tap it again to take it away.', count: 'Touch each shape once and count out loud.', more: 'Count each group. Which count is bigger?', onemore: 'Count them, then count one more.'
};
function hintFor(k: string): string {
  const old = band === '9-10' || band === '11-12';
  if (old && k === 'add') return 'Add the ones first, then the tens, then the hundreds. Carry if you need to.';
  if (old && k === 'subtract') return 'Take away the ones first, then the tens. Borrow if you need to.';
  if (old && k === 'multiply') return 'Break one number into parts, for example 7 × 6 = 7 × 5 + 7.';
  if (old && k === 'divide') return 'Think of the times table backwards: what times the small number gives the big one?';
  return HINTS[k];
}
const COL: Record<string, string> = { red: '#d6453d', blue: '#2f6fd0', green: '#2e9c57', yellow: '#e3b21c', purple: '#8a4fc7', orange: '#e8781f' };
function shapeSvg(shape: string, color: string, size = 34): string {
  const f = COL[color]; const s = { circle: `<circle cx="14" cy="14" r="11" fill="${f}"/>`, square: `<rect x="4" y="4" width="20" height="20" rx="3" fill="${f}"/>`, triangle: `<polygon points="14,3 26,25 2,25" fill="${f}"/>`,
    star: `<polygon points="14,2 17.5,10.5 26,11 19.5,17 21.5,26 14,21 6.5,26 8.5,17 2,11 10.5,10.5" fill="${f}"/>`, heart: `<path d="M14 25 L3 13 A6.5 6.5 0 0 1 14 7 A6.5 6.5 0 0 1 25 13 Z" fill="${f}"/>` } as Record<string, string>;
  return `<svg viewBox="0 0 28 28" width="${size}" height="${size}" aria-hidden="true">${s[shape]}</svg>`;
}
const OBJ = 'min(14vw,56px)';
const objBtn = (g: Group, i: number) => `<button class="obj" data-i="${i}" aria-label="${g.color} ${g.shape} ${i + 1}">${shapeSvg(g.shape, g.color, 48)}<span class="num" aria-hidden="true"></span></button>`;
let spoken = false; // voice-counting help, switched on after repeated misses
function say(t: string) { try { const u = new SpeechSynthesisUtterance(t); u.rate = 0.8; const v = chooseVoice(speechSynthesis.getVoices(), kv.getItem('voice-name') || ''); if (v) u.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* no voice available */ } }
let counted = 0;
function wireCounting(extra: boolean) {
  counted = 0; $('count').textContent = '';
  document.querySelectorAll<HTMLButtonElement>('#art .obj').forEach(b => b.onclick = () => {
    if (b.classList.contains('on')) return;
    counted++; b.classList.add('on'); (b.querySelector('.num') as HTMLElement).textContent = String(counted); $('count').textContent = String(counted);
    if (spoken) say(String(counted));
  });
}
function showAllNumbers() { document.querySelectorAll<HTMLElement>('#art .grp').forEach(g => g.querySelectorAll<HTMLElement>('.obj').forEach((b, i) => { b.classList.add('on'); (b.querySelector('.num') as HTMLElement).textContent = String(i + 1); })); }

function show(id: 'menu' | 'game' | 'chaps') { for (const x of ['menu', 'game', 'chaps']) $(x).hidden = x !== id; }
function renderMenu() {
  $('pts').textContent = String(progress.points); $('streak').textContent = String(progress.streak);
  $('confirm').hidden = true;
  $('bands').innerHTML = BANDS.map(b => `<button class="chip big" data-b="${b}">Ages ${b.replace('-', ' to ')}</button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('#bands button').forEach(el => el.onclick = () => { band = el.dataset.b as AgeBand; begin(); });
}
function newRun() { items = playList(band!, 1000 + Math.floor(Math.random() * 900000)); idx = 0; }
function clearAdv() { if (adv) { clearTimeout(adv); adv = null; } }
function startFree() { clearAdv(); mode = 'free'; history = []; played = 0; newRun(); show('game'); renderQ(); }
// A child lands on the lesson for their current chapter (tutorial first), then 10 questions in progression.
function begin() { const len = CHAPTERS[band!].length; const cur = chDone[band!] ?? 0; if (cur >= len) showFinished(); else startChapter(cur, true); }
function startChapter(i: number, withTutorial: boolean) {
  clearAdv(); mode = 'chapter'; chIdx = i; history = []; played = 0; curMiss = false; show('game');
  items = chapterQuestions(curCh(), 1 + Math.floor(Math.random() * 90000), setLen); idx = 0;
  if (withTutorial) { tut = tutorialFor(curCh()); ti = 0; renderStep(); } else renderQ();
}
function setButtons(html: string) { $('opts').className = 'endbtns'; $('opts').innerHTML = html; }
// ---- garden: a gentle reward for finishing a set. Effort, not time; nothing is ever lost; stored on this device only. ----
const BLOOMS = ['🌷', '🌻', '🌼', '🌸', '🪻'];
let garden: { w: number; d: number } = (() => { try { const g = JSON.parse(kv.getItem('demo-garden') || ''); return { w: +g.w || 0, d: +g.d || 0 }; } catch { return { w: 0, d: -1 }; } })();
const saveGarden = () => { try { kv.setItem('demo-garden', JSON.stringify(garden)); } catch { /* keep in memory */ } };
// One drop of water per finished set, plus one bonus drop for the first set on a new day. Four drops grow one flower.
function waterGarden(): { drops: number; bonus: boolean } { const t = today(); const bonus = garden.d !== -1 && garden.d !== t; garden.w += 1 + (bonus ? 1 : 0); garden.d = t; saveGarden(); return { drops: 1 + (bonus ? 1 : 0), bonus }; }
function gardenHtml(): string {
  const full = Math.floor(garden.w / 4); const part = garden.w % 4; const shown = Math.min(full, 12);
  const blooms = Array.from({ length: shown }, (_, i) => `<span class="pl">${BLOOMS[i % BLOOMS.length]}</span>`).join('');
  const growing = part === 0 ? '' : `<span class="pl">${part === 1 ? '🌱' : part === 2 ? '🌿' : '🪴'}</span>`;
  const more = full > 12 ? `<span class="pl more">+${full - 12} more</span>` : '';
  const label = `Your garden: ${full} flower${full === 1 ? '' : 's'}${part ? ' and one growing' : ''}`;
  return `<div class="garden" role="img" aria-label="${label}">${blooms}${more}${growing || (full === 0 ? '<span class="pl">🌱</span>' : '')}</div>`;
}
function showResult() {
  clearAdv(); const n = history.filter(Boolean).length; const ok = n >= masteryFor(setLen); const len = CHAPTERS[band!].length; const hasNext = chIdx + 1 < len;
  if (ok) { chDone[band!] = Math.max(chDone[band!] ?? 0, chIdx + 1); saveCh(); }
  const w = waterGarden();
  $('who').textContent = whoText(); $('art').innerHTML = ''; $('count').textContent = ''; $('say').dataset.t = '';
  $('q').textContent = ok ? (young() ? `Chapter complete! You got ${n} on the first try.` : `Chapter complete! ${n} of ${setLen} right first time.`) : (young() ? `You got ${n} on the first try. Good effort!` : `${n} of ${setLen} right first time. Good effort!`);
  $('msg').innerHTML = ok ? (hasNext ? `Next chapter: <b>${CHAPTERS[band!][chIdx + 1].title}</b>` : 'You finished every chapter for this age. Well done!') : 'Let us look at the lesson once more, then try again. Practice helps. No points are lost.';
  $('msg').innerHTML += `<p class="gtxt">${w.bonus ? 'Welcome back! Two drops of water for your garden today.' : 'A drop of water for your garden!'}</p>${gardenHtml()}<p class="gtxt">Come back tomorrow and your garden gets a bonus drop.</p>`;
  setButtons(ok ? (hasNext ? '<button class="opt primary" id="b1">Next chapter</button><button class="opt" id="b2">Play a mixed game instead</button>' : '<button class="opt primary" id="b1">See all chapters</button><button class="opt" id="b2">Free play</button>')
    : '<button class="opt primary" id="b1">Watch the lesson again</button><button class="opt" id="b2">Try again</button>');
  $('b1').onclick = () => ok ? (hasNext ? startChapter(chIdx + 1, true) : showChapters()) : startChapter(chIdx, true);
  $('b2').onclick = () => ok ? startFree() : startChapter(chIdx, false);
}
function showFinished() {
  mode = 'chapter'; show('game'); $('who').textContent = `${bandText()} · All chapters`; $('bar').innerHTML = ''; $('art').innerHTML = ''; $('count').textContent = '';
  $('q').textContent = 'You finished every chapter for this age. Well done!'; $('msg').textContent = 'You can look at any chapter again, or play free practice.'; $('say').dataset.t = $('q').textContent!;
  setButtons('<button class="opt primary" id="b1">See all chapters</button><button class="opt" id="b2">Free play</button>'); $('b1').onclick = showChapters; $('b2').onclick = startFree;
}
function showChapters() {
  clearAdv(); show('chaps'); $('chtitle').textContent = `${bandText()} chapters`;
  $('chlist').innerHTML = CHAPTERS[band!].map((c, i) => `<button class="chrow" data-i="${i}"><span>${i + 1}. ${c.title}</span><span aria-hidden="true">${i < (chDone[band!] ?? 0) ? '✔' : ''}</span><span class="sr">${i < (chDone[band!] ?? 0) ? 'done' : ''}</span></button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('#chlist button').forEach(b => b.onclick = () => startChapter(+b.dataset.i!, true));
}
// ---- money and clock drawings (play money: no portraits, no real designs) ----
const COIN: Record<number, { r: number; fill: string; edge: string; a: string; b: string }> = {
  1: { r: 15, fill: '#c9824a', edge: '#8a4f26', a: 'ONE', b: 'CENT' }, 5: { r: 17, fill: '#cfd3d9', edge: '#8d939c', a: 'FIVE', b: 'CENTS' },
  10: { r: 13.5, fill: '#dadde2', edge: '#9aa0a8', a: 'ONE', b: 'DIME' }, 25: { r: 20, fill: '#d2d6db', edge: '#8d939c', a: 'QUARTER', b: 'DOLLAR' } };
const NAMES: Record<number, string> = { 1: 'penny', 5: 'nickel', 10: 'dime', 25: 'quarter' };
function coinSvg(c: number) { const k = COIN[c]; const fs = c === 25 ? 4.6 : 5.2; return `<svg viewBox="0 0 44 44" width="${Math.round(k.r * 5.4)}" height="${Math.round(k.r * 5.4)}" role="img" aria-label="${NAMES[c]}"><circle cx="22" cy="22" r="${k.r}" fill="${k.fill}" stroke="${k.edge}" stroke-width="1.6"/><circle cx="22" cy="22" r="${k.r - 2.6}" fill="none" stroke="${k.edge}" stroke-width=".7" opacity=".7"/><text x="22" y="21" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#3a3a3a" font-family="Georgia,serif">${k.a}</text><text x="22" y="27" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#3a3a3a" font-family="Georgia,serif">${k.b}</text></svg>`; }
const BILLCOL: Record<number, string> = { 100: '#a9cfa4', 500: '#93c28f', 1000: '#7db87a', 2000: '#68ab68' };
function billSvg(c: number) { const t = fmtMoney(c); const col = BILLCOL[c] ?? '#93c28f'; return `<svg viewBox="0 0 120 56" width="132" height="62" role="img" aria-label="${t} play note"><rect x="1.5" y="1.5" width="117" height="53" rx="5" fill="${col}" stroke="#3f7a43" stroke-width="2"/><rect x="7" y="7" width="106" height="42" rx="3" fill="none" stroke="#3f7a43" stroke-width="1" stroke-dasharray="3 2"/><circle cx="60" cy="28" r="15" fill="#e6f2e3" stroke="#3f7a43" stroke-width="1.2"/><text x="60" y="35" text-anchor="middle" font-size="20" font-weight="800" fill="#1f4d27" font-family="Georgia,serif">${t}</text><text x="13" y="19" font-size="9" font-weight="800" fill="#1f4d27">${t}</text><text x="107" y="46" text-anchor="end" font-size="9" font-weight="800" fill="#1f4d27">${t}</text><text x="60" y="52" text-anchor="middle" font-size="4.5" fill="#1f4d27">PLAY MONEY</text></svg>`; }
function tagSvg(c: number) { const t = fmtMoney(c); return `<svg viewBox="0 0 110 54" width="120" height="58" role="img" aria-label="Price ${t}"><path d="M4 27 L22 5 H106 V49 H22 Z" fill="#fff4d6" stroke="#b8860b" stroke-width="2"/><circle cx="20" cy="27" r="3.5" fill="#fff" stroke="#b8860b"/><text x="64" y="35" text-anchor="middle" font-size="22" font-weight="800" fill="#5a3d00" font-family="system-ui">${t}</text></svg>`; }
function moneyHtml(v: { coins?: number[]; bills?: number[]; tag?: number }) {
  return `<div class="money" aria-hidden="false">${v.tag ? tagSvg(v.tag) : ''}${(v.bills ?? []).map(billSvg).join('')}${(v.coins ?? []).map(coinSvg).join('')}</div>`;
}
function clockSvg(h: number, m: number) {
  const P = (a: number, L: number) => `${(80 + L * Math.sin(a * Math.PI / 180)).toFixed(1)}`, Q = (a: number, L: number) => `${(80 - L * Math.cos(a * Math.PI / 180)).toFixed(1)}`;
  const ticks = Array.from({ length: 60 }, (_, i) => { const L = i % 5 === 0 ? 7 : 3.5; return `<line x1="${P(i * 6, 70 - L)}" y1="${Q(i * 6, 70 - L)}" x2="${P(i * 6, 70)}" y2="${Q(i * 6, 70)}" stroke="#51675f" stroke-width="${i % 5 === 0 ? 2 : 1}"/>`; }).join('');
  const nums = Array.from({ length: 12 }, (_, i) => `<text x="${P((i + 1) * 30, 53)}" y="${(+Q((i + 1) * 30, 53) + 5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="700" fill="#17332c" font-family="system-ui">${i + 1}</text>`).join('');
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  return `<svg viewBox="0 0 160 160" width="190" height="190" role="img" aria-label="Clock face"><circle cx="80" cy="80" r="76" fill="#fff" stroke="#1d8a76" stroke-width="4"/>${ticks}${nums}<line x1="80" y1="80" x2="${P(ha, 33)}" y2="${Q(ha, 33)}" stroke="#17332c" stroke-width="6.5" stroke-linecap="round"/><line x1="80" y1="80" x2="${P(ma, 56)}" y2="${Q(ma, 56)}" stroke="#d6453d" stroke-width="3.5" stroke-linecap="round"/><circle cx="80" cy="80" r="5" fill="#17332c"/></svg>`;
}
const MHINT: Record<string, string> = { coinvalue: 'Look at the words on the coin.', coinname: 'Look at the words and the size of the coin.', coinmore: 'A bigger coin is not always worth more. Think about what each coin is worth.', coincount: 'Start with the biggest coin, then count on.', billcount: 'Start with the biggest note, then count on.', change: 'Count up from the price to the next dollar, then up to what you paid.', clock: 'The short hand shows the hour. The long hand shows the minutes.', elapsed: 'Count on to the next hour first, then add the rest.' };
function renderMeas(p: MeasPuzzle) {
  $('art').setAttribute('aria-label', p.alt);
  $('art').innerHTML = p.clock ? `<div class="clockbox">${clockSvg(p.clock.h, p.clock.m)}</div>` : moneyHtml({ coins: p.coins, bills: p.bills, tag: p.tag });
  $('opts').className = ''; $('opts').innerHTML = p.choices.map(c => `<button class="opt" data-v="${c}">${c}</button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('#opts button').forEach(el => el.onclick = () => {
    if (el.dataset.v === p.answer) { succeed(); return; }
    tries++; el.disabled = true; markMiss(); if (tries >= 2) say(MHINT[p.kind]);
    $('msg').textContent = `Nearly! Hint: ${MHINT[p.kind]} Try again.`;
  });
}
// ---- tutorial player: concrete objects, then pictures, then numbers ----
function visual(v: V): string {
  if (v.t === 'none') return '';
  if (v.t === 'balance') return `<div class="bal" aria-hidden="true"><div class="pan">${v.left}</div><div class="eq">=</div><div class="pan">${v.right}</div></div>`;
  if (v.t === 'text') return `<div class="bigtxt">${v.big}</div>`;
  if (v.t === 'objects') {
    const parts = v.parts.map(p => `<div class="grp">${Array.from({ length: p.n }, (_, k) => { const x = !!p.crossed && k >= p.n - p.crossed; const sv = shapeSvg(p.shape, p.color, 40);
      return v.tap ? `<button class="obj" aria-label="${p.color} ${p.shape} ${k + 1}">${sv}<span class="num" aria-hidden="true"></span></button>` : `<span class="obj static${x ? ' cross' : ''}">${sv}<span class="num" aria-hidden="true"></span></span>`; }).join('')}</div>`);
    return `<div class="vrow">${parts.join(v.sign ? `<span class="sign" aria-hidden="true">${v.sign}</span>` : '')}</div>`;
  }
  if (v.t === 'frame') return `<div class="frame" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<div class="cell ${i < v.filled ? 'on' : i < v.filled + (v.extra ?? 0) ? 'on2' : ''}"></div>`).join('')}</div>`;
  if (v.t === 'blocks') { const n = v.op === '+' ? v.a + v.b : v.a; return `<div class="blocks" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<span class="blk ${v.op === '+' ? (i < v.a ? 'ba' : i < n ? 'bb' : '') : (i < v.a - v.b ? 'ba' : i < v.a ? 'bx' : '')}"></span>`).join('')}</div><p class="cap">${v.op === '+' ? `${v.a} + ${v.b} = ${n}: ${pattern(n)}.` : `${v.a} − ${v.b} = ${v.a - v.b}: ${pattern(v.a - v.b)}.`}</p>`; }
  if (v.t === 'money') return moneyHtml(v);
  if (v.t === 'clock') return `<div class="clockbox">${clockSvg(v.h, v.m)}</div>`;
  if (v.t === 'line') { const r = v.op === '+' ? v.a + v.b : v.a - v.b; return `<div class="line" aria-hidden="true">${Array.from({ length: 20 }, (_, i) => `<span class="bead ${i + 1 === v.a ? 'here' : i + 1 === r ? 'goal' : ''}">${i + 1}</span>`).join('')}</div><p class="cap">Start at ${v.a}, ${v.op === '+' ? 'count up' : 'count back'} ${v.b}, land on ${r}.</p>`; }
  if (v.t === 'bar') { const a = v.a ?? (v.total! - v.b!); const b = v.b ?? (v.total! - v.a!); const cell = (n: number | null, real: number) => `<div class="bmp ${n === null ? 'unk' : ''}" style="flex:${Math.max(real, 1)}">${n === null ? '?' : n}</div>`;
    return `<div class="bm" aria-hidden="true"><div class="bmtop ${v.total === null ? 'unk' : ''}">${v.total ?? '?'}</div><div class="bmrow">${cell(v.a, a)}${cell(v.b, b)}</div></div>`; }
  if (v.t === 'array') return `<div class="arr" aria-hidden="true" style="grid-template-columns:repeat(${v.cols},1fr)">${Array.from({ length: v.rows * v.cols }, () => '<span class="dot"></span>').join('')}</div>`;
  const m = Math.max(v.a, v.b, 1); return `<div class="cmp" aria-hidden="true"><div><span>${v.a}</span><i style="width:${(v.a / m) * 100}%"></i></div><div><span>${v.b}</span><i style="width:${(v.b / m) * 100}%"></i></div></div>`;
}
function renderStep() {
  const s = tut[ti]; show('game'); spoken = false; $('who').textContent = whoText(); $('prog').textContent = `${progress.points} points`; $('bar').innerHTML = ''; $('count').textContent = '';
  $('q').textContent = s.say; $('say').dataset.t = s.say; $('art').innerHTML = visual(s.v); $('art').setAttribute('aria-label', s.say); if (s.v.t === 'objects' && s.v.tap) wireCounting(false);
  $('msg').textContent = `Lesson: step ${ti + 1} of ${tut.length}`;
  const last = ti === tut.length - 1;
  setButtons(`${ti > 0 ? '<button class="opt" id="tb">Back</button>' : ''}<button class="opt primary" id="tn">${last ? 'Start the questions' : 'Next'}</button>${last ? '' : `<button class="${young() ? 'opt' : 'small'}" id="ts">${young() ? 'Skip to the questions' : 'Skip the lesson'}</button>`}`);
  const go = () => { idx = 0; history = []; renderQ(); };
  $('tn').onclick = () => last ? go() : (ti++, renderStep()); if (ti > 0) $('tb').onclick = () => { ti--; renderStep(); }; if (!last) $('ts').onclick = go;
}
function renderBar() {
  const bar = $('bar');
  if (mode === 'chapter') { const n = setLen; const h = history.length;
    bar.setAttribute('aria-label', `Question ${Math.min(h + 1, n)} of ${n}. ${history.filter(Boolean).length} right first time so far`);
    bar.innerHTML = Array.from({ length: n }, (_, i) => i < h ? `<span class="seg ${history[i] ? 'done' : 'miss'}"></span>` : i === h ? `<span class="seg now ${curMiss ? 'miss' : ''}"></span>` : '<span class="seg"></span>').join(''); return; }
  const last = history.slice(-10);
  bar.setAttribute('aria-label', `Your recent answers: ${last.filter(Boolean).length} right first time out of ${last.length}`);
  bar.innerHTML = last.map(ok => `<span class="seg ${ok ? 'done' : 'miss'}" title="${ok ? 'right first time' : 'needed another try'}"></span>`).join('') + (last.length < 10 ? `<span class="seg now ${curMiss ? 'miss' : ''}"></span>` : '');
}
const BAL = ['#e0554c', '#2f6fd0', '#2e9c57', '#e8a21c', '#8a4fc7', '#e8781f'];
function beadHtml(h: { a: number; b: number; op: '+' | '-'; answer: number }) {
  return `<div class="line" aria-label="Number line from 1 to 20. Start at ${h.a}.">${Array.from({ length: 20 }, (_, i) => `<span class="bead ${i + 1 === h.a ? 'here' : ''}" data-n="${i + 1}">${i + 1}</span>`).join('')}</div><div class="hopbar"><button id="hop" class="small">Hop ${h.op === '+' ? '+1' : '−1'}</button><span id="hopn" aria-live="polite"></span></div>`;
}
function wireHop(h: { a: number; b: number; op: '+' | '-'; answer: number }) {
  let pos = h.a, done = 0;
  const btn = $('hop') as HTMLButtonElement;
  btn.onclick = () => {
    if (done >= h.b) return;
    pos += h.op === '+' ? 1 : -1; done++;
    document.querySelectorAll('#art .bead').forEach(b => b.classList.toggle('here', +(b as HTMLElement).dataset.n! === pos));
    $('hopn').textContent = ` ${done} hop${done === 1 ? '' : 's'}`;
    say(String(pos));
    if (done >= h.b) { btn.disabled = true; $('hopn').textContent += ` — you landed on ${pos}`; }
  };
}
function frameHtml(f: FramePuzzle) { return `<div class="frame" role="group" aria-label="Frame with ten circles">${Array.from({ length: 10 }, (_, i) => `<button class="cell" data-c="${i}" aria-pressed="false" aria-label="Circle ${i + 1}"></button>`).join('')}</div>`; }
function wireFrame(f: FramePuzzle) {
  let filled = 0; $('count').textContent = '0';
  document.querySelectorAll<HTMLButtonElement>('#art .cell').forEach(c => c.onclick = () => {
    const on = c.classList.toggle('on'); c.setAttribute('aria-pressed', String(on)); filled += on ? 1 : -1; $('count').textContent = String(filled);
    if (on && spoken) say(String(filled));
    if (filled === f.n) { succeed(); }
    else if (filled > f.n && on) { tries++; markMiss(); if (tries >= 2) { spoken = true; say(`We need ${f.n}. Tap a filled circle to take it away.`); } $('msg').textContent = tries >= 2 ? `We need ${f.n}. Tap a filled circle to take it away.` : 'Too many! Tap a filled circle to take one away.'; }
  });
}
function markMiss() { curMiss = true; renderBar(); }
function renderQ() {
  const it = items[idx]; $('prog').textContent = `${progress.points} points`; renderBar(); $('msg').textContent = ''; tries = 0; curMiss = false; renderBar();
  $('who').textContent = whoText();
  const speak = it.kind === 'pic' || it.kind === 'frame' || it.kind === 'meas' ? it.p.speak : it.p.prompt;
  $('q').textContent = speak; $('say').dataset.t = speak;
  let art = '';
  spoken = false; $('count').textContent = '';
  if (it.kind === 'meas') { renderMeas(it.p); return; }
  const isMore = it.kind === 'pic' && (it.p.kind === 'more' || it.p.kind === 'odd');
  let hop: ReturnType<typeof hopPlan> = null;
  if (it.kind === 'pic') {
    const p = it.p;
    if (p.kind === 'more') art = p.groups.map((g, i) => `<button class="card" data-g="${i}" aria-label="${g.n} ${g.color} ${g.shape}s. Tap if this group has more."><div class="grp">${Array.from({ length: g.n }, (_, k) => `<span class="obj static">${shapeSvg(g.shape, g.color, 40)}<span class="num" aria-hidden="true"></span></span>`).join('')}</div></button>`).join('');
    else if (p.kind === 'odd') art = `<div class="grp">${p.items!.map((x, i) => `<button class="obj pick" data-g="${i}" aria-label="${x.color} ${x.shape}">${shapeSvg(x.shape, x.color, 52)}</button>`).join('')}</div>`;
    else { const g = p.groups[0]; art = `<div class="grp">${Array.from({ length: g.n }, (_, k) => objBtn(g, k)).join('')}${p.kind === 'onemore' ? `<button class="obj slot" aria-label="one more">${'<span class="plus" aria-hidden="true">+1</span>'}<span class="num" aria-hidden="true"></span></button>` : ''}</div>`; }
    $('art').setAttribute('aria-label', p.alt);
  } else if (it.kind === 'frame') { art = frameHtml(it.p); $('art').removeAttribute('aria-label'); }
  else { $('art').removeAttribute('aria-label'); hop = hopPlan(it.p); if (hop) art = beadHtml(hop); }
  $('art').innerHTML = art;
  const bm = it.kind === 'num' ? it.p.prompt.match(/^(\d+) ([+-]) (\d+) = \?$/) : null;
  if (bm) { const A = +bm[1], B = +bm[3], plus = bm[2] === '+'; if (plus ? A + B <= 10 : A <= 10) { $('art').insertAdjacentHTML('beforeend', '<div class="hopbar"><button id="blk" class="small">Show it with blocks</button></div><div id="blkbox"></div>'); $('blk').onclick = () => { $('blkbox').innerHTML = visual({ t: 'blocks', a: A, b: B, op: plus ? '+' : '-' }); ($('blk') as HTMLButtonElement).disabled = true; }; } }
  if (it.kind === 'pic' && !isMore) wireCounting(it.p.kind === 'onemore');
  if (it.kind === 'frame') wireFrame(it.p);
  if (hop) wireHop(hop);
  document.querySelectorAll<HTMLButtonElement>('#art .card, #art .pick').forEach(el => el.onclick = () => answer(el, +el.dataset.g!));
  const opts = isMore || it.kind === 'frame' ? [] : it.p.choices.map(c => ({ v: c, t: String(c) }));
  $('opts').className = it.kind === 'num' ? 'balloons' : '';
  $('opts').innerHTML = opts.map((o, i) => `<button class="opt ${it.kind === 'num' ? 'balloon' : ''}" style="--bc:${BAL[i % BAL.length]}" data-v="${o.v}"><span>${o.t}</span></button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('#opts button').forEach(el => el.onclick = () => answer(el, +el.dataset.v!));
}
// Halfway through a set: a short movement break the child can skip. Never timed, never penalised.
function stretchBreak() {
  clearAdv(); $('art').innerHTML = '<div class="stretch" aria-hidden="true">🙆</div>'; $('count').textContent = '';
  $('q').textContent = band === '11-12' || band === '9-10' ? 'Stretch break. Stand up and stretch for a moment.' : 'Stretch break! Reach up high, then hop 5 times.'; $('say').dataset.t = $('q').textContent!; $('msg').textContent = 'Halfway there. Tap when you are ready.';
  setButtons('<button class="opt primary" id="b1">I am ready</button><button class="opt" id="b2">Skip the break</button>');
  const resume = () => { $('opts').className = ''; $('opts').innerHTML = ''; renderQ(); };
  $('b1').onclick = resume; $('b2').onclick = resume;
}
function succeed() {
  const it = items[idx]; const first = tries === 0;
  document.querySelectorAll<HTMLButtonElement>('#opts button, #art .card, #art .pick, #art .cell, #hop').forEach(b => b.disabled = true);
  history.push(first); played++; curMiss = false;
  progress = recordAnswer(progress, today(), first); void store.save('demo', progress); $('prog').textContent = `${progress.points} points`; renderBar();
  const word = first ? PRAISE[played % PRAISE.length] : 'You got it!';
  $('msg').innerHTML = `<div class="good" role="status"><span class="tick" aria-hidden="true">✔</span> ${word}</div><div class="wait"><span class="spin" aria-hidden="true"></span> Next puzzle… <button id="skip" class="small">Next</button></div>`;
  if (spoken) say(word);
  const go = () => { if (adv === null) return; clearTimeout(adv); adv = null; idx++; if (mode === 'chapter' && idx >= items.length) { showResult(); return; } if (mode === 'chapter' && setLen >= 10 && idx === Math.floor(setLen / 2)) { stretchBreak(); return; } if (idx >= items.length) newRun(); renderQ(); };
  adv = setTimeout(go, 1500); ($('skip') as HTMLElement).onclick = go;
}
function answer(el: HTMLButtonElement, v: number) {
  const it = items[idx];
  if (it.kind === 'frame') return;
  if (v === it.p.answer) { succeed(); return; }
  tries++; el.disabled = true;
  markMiss(); // show the miss in the bar right away
  const isPic = it.kind === 'pic';
  if (isPic && it.p.kind === 'odd') { if (tries >= 2) { document.querySelector<HTMLElement>(`#art .pick[data-g="${it.p.answer}"]`)?.classList.add('on'); say('Look for the shape that is not like the others.'); } }
  else if (isPic && tries >= 2) { spoken = true; if (it.p.kind === 'more') { showAllNumbers(); say('Let us count together.'); } else say('Let us count together. Touch each one.'); }
  $('msg').textContent = isPic && it.p.kind === 'odd' ? (tries >= 2 ? 'Look at the glowing one.' : 'Nearly! Look again.') : isPic ? (tries >= 2 ? 'Let us count together. Touch each one and I will say the number.' : 'Nearly! Touch each one to count them.') : 'Nearly! Here is a hint: ' + hintFor(it.p.kind) + ' Try again.';
}
$('exit').onclick = () => { clearAdv(); show('menu'); renderMenu(); };
$('chbtn').onclick = () => { if (band) showChapters(); };
$('chback').onclick = () => { show('menu'); renderMenu(); };
$('say').onclick = () => say($('say').dataset.t!);
$('reset').onclick = () => { $('confirm').hidden = false; ($('keep') as HTMLElement).focus(); };
$('keep').onclick = () => { $('confirm').hidden = true; ($('reset') as HTMLElement).focus(); };
$('wipe').onclick = async () => { garden = { w: 0, d: -1 }; chDone = {}; saveGarden(); saveCh(); progress = newProgress(); await store.save('demo', progress); renderMenu(); };
(async () => { const p = await store.load('demo'); if (p) progress = p; renderMenu(); show('menu'); })();

{ const box = document.getElementById('setlen'); if (box) { box.innerHTML = SET_LENGTHS.map(n => `<button class="small${n === setLen ? ' primary' : ''}" data-n="${n}" aria-pressed="${n === setLen}">${n} questions</button>`).join('');
  box.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.onclick = () => { setLen = +b.dataset.n!; try { kv.setItem('set-len', String(setLen)); } catch {} box.querySelectorAll<HTMLButtonElement>('button').forEach(x => { const on = +x.dataset.n! === setLen; x.className = 'small' + (on ? ' primary' : ''); x.setAttribute('aria-pressed', String(on)); }); }); } }

// Offline after the first visit (only on the hosted page; ignored when opened as a file).
try { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js').catch(() => {}); } catch { /* no offline cache */ }
