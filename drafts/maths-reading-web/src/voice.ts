// Voice choice for the on-device speech. The browser does not say whether a voice is female or male,
// so this guesses from the voice name (a known limit) and lets a parent pick any voice by hand.
const FEMALE = /\b(zira|aria|jenny|michelle|samantha|karen|moira|tessa|victoria|allison|ava|susan|fiona|serena|emma|libby|sonia|natasha|hazel|catherine|linda|heather|joanna|salli|kendra|kimberly|ivy|nicole|amy|female|woman)\b/i;
const MALE = /\b(david|mark|guy|daniel|alex|fred|tom|aaron|george|james|ryan|brian|matthew|joey|justin|russell|oliver|arthur|rishi|male|man)\b/i;
export interface V { name: string; lang: string; localService: boolean }
export const isFemaleName = (n: string) => FEMALE.test(n);
export const isMaleName = (n: string) => !FEMALE.test(n) && MALE.test(n);
export function englishLocal<T extends V>(vs: T[]): T[] { return vs.filter(v => v.lang.toLowerCase().startsWith('en') && v.localService); }
// saved = the name a parent chose ('' = automatic). Automatic prefers en-US female-sounding, then a voice named Mark, then any non-male, then the first.
export function chooseVoice<T extends V>(vs: T[], saved: string): T | null {
  const ok = englishLocal(vs); if (!ok.length) return null;
  const s = saved && ok.find(v => v.name === saved); if (s) return s;
  const us = (a: T[]) => a.find(v => v.lang === 'en-US') ?? a[0] ?? null;
  return us(ok.filter(v => isFemaleName(v.name))) ?? us(ok.filter(v => /\bmark\b/i.test(v.name))) ?? us(ok.filter(v => !isMaleName(v.name))) ?? ok[0];
}
