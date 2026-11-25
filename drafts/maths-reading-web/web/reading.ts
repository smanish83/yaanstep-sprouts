import { chooseVoice, englishLocal, isFemaleName } from '../src/voice.ts';
import { LETTER_SETS, letterSpeech, PICTURE_SETS, BLEND_SETS, COMMON, DRAWINGS, type Letter } from '../src/reading.ts';
const $ = (id: string) => document.getElementById(id)!;
let mem: Record<string, string> = {};
const kv = (() => { try { localStorage.setItem('t', '1'); localStorage.removeItem('t'); return localStorage; } catch { return { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; } }; } })();
const SPEEDS = [0.65, 0.8, 0.95, 1.1]; let speed = (() => { const v = +(kv.getItem('rd-speed') || '0.8'); return SPEEDS.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); })(); let limit = +(kv.getItem('rd-limit') || '30'); let taps = 0; let step = 0; let shown = 1;
const LIMITS = [15, 30, 50, 0];
// On-device voices only (Hiroshi): if none, show words silently.
let voice: SpeechSynthesisVoice | null = null; let voiceOk = true;
function pickVoice() { try { const all = speechSynthesis.getVoices(); voice = chooseVoice(all, kv.getItem('voice-name') || ''); voiceOk = !!voice || all.length === 0; $('novoice').style.display = voiceOk ? 'none' : 'block'; fillVoices(all); } catch { voiceOk = false; $('novoice').style.display = 'block'; } }
function fillVoices(all: SpeechSynthesisVoice[]) { const sel = document.getElementById('voicesel') as HTMLSelectElement | null; if (!sel) return; const ok = englishLocal(all); sel.innerHTML = '<option value="">Automatic (prefers a female-sounding voice)</option>' + ok.map(v => `<option value="${v.name.replace(/"/g, '')}">${v.name}${isFemaleName(v.name) ? ' (female-sounding)' : ''}</option>`).join(''); sel.value = kv.getItem('voice-name') || ''; }
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch { voiceOk = false; }
function say(t: string) { if (!voiceOk && !voice) return; try { const u = new SpeechSynthesisUtterance(t); u.rate = speed; if (voice) u.voice = voice; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* silent */ } }
function tap(t?: string) { if (t) say(t); taps++; if (limit && taps >= limit && $('alldone').hidden) { $('alldone').hidden = false; $('alldone').scrollIntoView({ block: 'nearest' }); } }
const STEPS = [{ n: 'A1 Letter sounds', a: 'ages 3 to 5' }, { n: 'A2 Picture words', a: 'ages 3 to 6' }, { n: 'A3 Tap to blend', a: 'ages 5 to 7' }, { n: 'A4 Common words', a: 'ages 5 to 7' }];
function menu() { $('game').hidden = true; $('menu').hidden = false;
  $('steps').innerHTML = STEPS.map((s, i) => `<button class="step" data-i="${i}"><span>${s.n}<small>${s.a}</small></span><span aria-hidden="true">▶</span></button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('#steps button').forEach(b => b.onclick = () => open(+b.dataset.i!));
  const pill = (el: string, vals: number[], cur: number, key: string, lab: (v: number) => string, set: (v: number) => void) => { $(el).innerHTML = vals.map(v => `<button class="small" aria-pressed="${v === cur}" data-v="${v}">${lab(v)}</button>`).join(''); document.querySelectorAll<HTMLButtonElement>(`#${el} button`).forEach(b => b.onclick = () => { set(+b.dataset.v!); kv.setItem(key, String(+b.dataset.v!)); menu(); }); };
  pill('speed', SPEEDS, speed, 'rd-speed', v => v === 0.65 ? 'Slow' : v === 0.8 ? 'Calm' : v === 0.95 ? 'Normal' : 'Quick', v => { speed = v; });
  { const sel = document.getElementById('voicesel') as HTMLSelectElement; try { fillVoices(speechSynthesis.getVoices()); } catch { /* none */ } sel.onchange = () => { kv.setItem('voice-name', sel.value); pickVoice(); say('Hello! Let us read together.'); }; ($('hear') as HTMLButtonElement).onclick = () => say('Hello! Let us read together.'); }
  pill('limit', LIMITS, limit, 'rd-limit', v => v ? String(v) : 'No break', v => { limit = v; }); }
function open(i: number) { step = i; shown = 1; taps = 0; $('alldone').hidden = true; $('menu').hidden = true; $('game').hidden = false; $('title').textContent = STEPS[i].n; render(); }
const setsFor = () => [LETTER_SETS.length, PICTURE_SETS.length, BLEND_SETS.length, Math.ceil(COMMON.length / 6)][step];
function render() {
  $('sub').textContent = ''; const area = $('area');
  if (step === 0) { const ls: Letter[] = LETTER_SETS.slice(0, shown).flat(); area.innerHTML = `<div class="tiles">${ls.map((x, i) => `<button class="tile" data-i="${i}" aria-label="letter ${x.l}, as in ${x.word}">${x.l}</button>`).join('')}</div>`;
    document.querySelectorAll<HTMLButtonElement>('#area .tile').forEach(b => b.onclick = () => { const x = ls[+b.dataset.i!]; b.classList.add('on'); $('sub').textContent = `${x.l} as in ${x.word}`; tap(letterSpeech(x)); }); }
  else if (step === 1) { const ws = PICTURE_SETS.slice(0, shown).flat(); area.innerHTML = `<div class="tiles">${ws.map((w, i) => `<button class="tile" data-i="${i}" aria-label="${w}"><svg viewBox="0 0 64 64" aria-hidden="true">${DRAWINGS[w]}</svg><span class="w">${w}</span></button>`).join('')}</div>`;
    document.querySelectorAll<HTMLButtonElement>('#area .tile').forEach(b => b.onclick = () => { const w = ws[+b.dataset.i!]; b.classList.add('on'); $('sub').textContent = w; tap(w); }); }
  else if (step === 2) { const ws = BLEND_SETS.slice(0, shown).flat(); const all = LETTER_SETS.flat(); area.innerHTML = ws.map((w, i) => `<div class="wcard" data-w="${w}">${[...w].map(ch => `<button class="let" data-l="${ch}" aria-label="letter ${ch}">${ch}</button>`).join('')}<button class="whole" aria-label="the whole word ${w}">${w}</button></div>`).join('');
    document.querySelectorAll<HTMLElement>('#area .wcard').forEach(card => { card.querySelectorAll<HTMLButtonElement>('.let').forEach(b => b.onclick = () => { const x = all.find(a => a.l === b.dataset.l)!; b.classList.add('on'); tap(letterSpeech(x)); });
      (card.querySelector('.whole') as HTMLButtonElement).onclick = () => { card.querySelectorAll('.let').forEach(b => b.classList.add('on')); tap(card.dataset.w); }; }); }
  else { const cs = COMMON.slice(0, shown * 6); area.innerHTML = `<div class="tiles">${cs.map((c, i) => `<button class="tile" data-i="${i}" aria-label="word ${c[0]}"><span class="word">${c[0]}</span></button>`).join('')}</div>`;
    document.querySelectorAll<HTMLButtonElement>('#area .tile').forEach(b => b.onclick = () => { const c = cs[+b.dataset.i!]; b.classList.add('on'); $('sub').textContent = c[1]; tap(`${c[0]}. ${c[1]}`); }); }
  ($('more') as HTMLButtonElement).hidden = shown >= setsFor();
}
$('more').onclick = () => { shown++; render(); };
$('exit').onclick = () => { try { speechSynthesis.cancel(); } catch { /* ok */ } menu(); };
$('keep').onclick = () => { taps = -1000; $('alldone').hidden = true; };
$('stop').onclick = () => { $('alldone').hidden = true; menu(); };
menu();

// Offline after the first visit (only on the hosted page; ignored when opened as a file).
try { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js').catch(() => {}); } catch { /* no offline cache */ }
