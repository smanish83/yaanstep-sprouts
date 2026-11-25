// Reading mode A (tap to hear) content: from project doc 18 (draft 1.1). Pure data, no child input.
export interface Letter { l: string; word: string }
export const LETTER_SETS: Letter[][] = [
  [['s', 'sun'], ['a', 'apple'], ['t', 'tiger'], ['p', 'pig']], [['i', 'igloo'], ['n', 'nest']],
  [['m', 'moon'], ['d', 'dog'], ['g', 'goat'], ['o', 'octopus'], ['c', 'cat'], ['k', 'kite']],
  [['e', 'egg'], ['u', 'umbrella'], ['r', 'rain'], ['h', 'hat'], ['b', 'ball'], ['f', 'fish']],
  [['l', 'lion'], ['j', 'jam'], ['v', 'van'], ['w', 'web'], ['x', 'box'], ['y', 'yes']], [['z', 'zebra'], ['q', 'queen']],
].map(s => s.map(([l, word]) => ({ l, word })));
export const letterSpeech = (x: Letter) => `${x.l}, as in ${x.word}`;
export const PICTURE_SETS: string[][] = [['cat', 'dog', 'sun', 'ball', 'moon', 'star'], ['hat', 'bus', 'cup', 'pig', 'fish', 'frog'], ['tree', 'book', 'bed', 'car', 'egg', 'cow', 'duck', 'milk']];
export const BLEND_SETS: string[][] = [
  ['sat', 'pat', 'tap', 'pan', 'pin', 'tin', 'sit', 'sip', 'tip', 'nap'],
  ['mat', 'map', 'dad', 'dig', 'dog', 'got', 'cat', 'cap', 'pot', 'kid'],
  ['red', 'run', 'hat', 'hot', 'bed', 'bus', 'bug', 'fun', 'fit', 'hen']];
// letters allowed in blend set i = all letters of letter sets 0..(i+1)? (set 1 = sets 1; set 2 = sets 1-2; set 3 = sets 1-3)
export const BLEND_LETTER_SETS = [[0, 1], [0, 1, 2], [0, 1, 2, 3]];
export const COMMON: [string, string][] = [['the', 'The dog runs.'], ['and', 'Cats and dogs.'], ['is', 'The sun is hot.'], ['to', 'I go to bed.'], ['you', 'You can hop.'], ['it', 'It is red.'], ['can', 'I can jump.'], ['see', 'I see a cat.'], ['we', 'We can play.'], ['my', 'This is my hat.'],
  ['a', 'A dog can run.'], ['I', 'I am happy.'], ['in', 'The cat is in the box.'], ['go', 'Let us go to the park.'], ['no', 'No, thank you.'], ['me', 'Play with me.'], ['he', 'He has a red hat.'], ['she', 'She has a big cup.'], ['on', 'The book is on the bed.'], ['up', 'Look up at the star.']];
// Original simple drawings (64 x 64). Drawn here from basic shapes; no copied artwork.
const E = (cx: number, cy: number) => `<circle cx="${cx}" cy="${cy}" r="2.6" fill="#17332c"/>`;
export const DRAWINGS: Record<string, string> = {
  cat: `<polygon points="14,26 18,8 28,20" fill="#e8a24a"/><polygon points="50,26 46,8 36,20" fill="#e8a24a"/><circle cx="32" cy="36" r="20" fill="#f0b05a"/>${E(24, 33)}${E(40, 33)}<polygon points="32,38 29,42 35,42" fill="#d6453d"/><path d="M10 38h12M10 44h12M42 38h12M42 44h12" stroke="#17332c" stroke-width="1.5"/>`,
  dog: `<ellipse cx="14" cy="34" rx="8" ry="15" fill="#8a5a33"/><ellipse cx="50" cy="34" rx="8" ry="15" fill="#8a5a33"/><circle cx="32" cy="34" r="20" fill="#c9965a"/>${E(24, 30)}${E(40, 30)}<ellipse cx="32" cy="42" rx="8" ry="6" fill="#f3dcc0"/><ellipse cx="32" cy="39" rx="3.5" ry="2.5" fill="#17332c"/>`,
  sun: `<g stroke="#e8a21c" stroke-width="4" stroke-linecap="round"><path d="M32 3v9M32 52v9M3 32h9M52 32h9M11 11l6 6M47 47l6 6M53 11l-6 6M17 47l-6 6"/></g><circle cx="32" cy="32" r="16" fill="#f7c948"/>${E(26, 29)}${E(38, 29)}<path d="M25 37q7 6 14 0" stroke="#17332c" stroke-width="2" fill="none"/>`,
  ball: `<circle cx="32" cy="32" r="24" fill="#d6453d"/><path d="M8 32h48M32 8c-12 10-12 38 0 48M32 8c12 10 12 38 0 48" stroke="#fff" stroke-width="3" fill="none"/>`,
  moon: `<path d="M40 8A26 26 0 1 0 40 56A32 32 0 0 1 40 8z" fill="#f2d675" stroke="#b8960f" stroke-width="2"/>`,
  star: `<polygon points="32,6 39,24 58,25 43,37 48,56 32,45 16,56 21,37 6,25 25,24" fill="#f7c948" stroke="#b8860b" stroke-width="2"/>`,
  hat: `<ellipse cx="32" cy="44" rx="28" ry="8" fill="#2f6fd0"/><path d="M16 44c0-22 6-30 16-30s16 8 16 30z" fill="#4b8be8"/><rect x="16" y="38" width="32" height="6" fill="#1f4f99"/>`,
  bus: `<rect x="5" y="14" width="54" height="34" rx="6" fill="#f2b21c" stroke="#a87800" stroke-width="2"/><rect x="10" y="19" width="10" height="11" fill="#cfe8f5"/><rect x="24" y="19" width="10" height="11" fill="#cfe8f5"/><rect x="38" y="19" width="10" height="11" fill="#cfe8f5"/><circle cx="18" cy="49" r="6" fill="#17332c"/><circle cx="46" cy="49" r="6" fill="#17332c"/>`,
  cup: `<path d="M12 16h34l-4 36a6 6 0 0 1-6 5H22a6 6 0 0 1-6-5z" fill="#4b8be8" stroke="#1f4f99" stroke-width="2"/><path d="M46 24h6a7 7 0 0 1 0 16h-8" stroke="#1f4f99" stroke-width="4" fill="none"/>`,
  pig: `<polygon points="14,22 14,8 26,16" fill="#f4a3b6"/><polygon points="50,22 50,8 38,16" fill="#f4a3b6"/><circle cx="32" cy="34" r="22" fill="#f7b8c8"/>${E(23, 30)}${E(41, 30)}<ellipse cx="32" cy="40" rx="9" ry="6.5" fill="#ee8fa6"/><circle cx="29" cy="40" r="1.6" fill="#17332c"/><circle cx="35" cy="40" r="1.6" fill="#17332c"/>`,
  fish: `<polygon points="48,32 62,18 62,46" fill="#e8781f"/><ellipse cx="30" cy="32" rx="22" ry="14" fill="#f29a45"/><circle cx="19" cy="28" r="3" fill="#fff"/><circle cx="19" cy="28" r="1.5" fill="#17332c"/><path d="M30 20q6 12 0 24" stroke="#c75e10" stroke-width="2" fill="none"/>`,
  frog: `<circle cx="20" cy="18" r="9" fill="#5fb85f"/><circle cx="44" cy="18" r="9" fill="#5fb85f"/><circle cx="20" cy="18" r="4" fill="#fff"/><circle cx="44" cy="18" r="4" fill="#fff"/><circle cx="20" cy="18" r="2" fill="#17332c"/><circle cx="44" cy="18" r="2" fill="#17332c"/><ellipse cx="32" cy="38" rx="24" ry="18" fill="#6cc66c"/><path d="M18 42q14 10 28 0" stroke="#17332c" stroke-width="2" fill="none"/>`,
  tree: `<rect x="27" y="36" width="10" height="24" fill="#8a5a33"/><circle cx="32" cy="26" r="20" fill="#3f9e5a"/><circle cx="22" cy="30" r="10" fill="#4fb36a"/><circle cx="43" cy="22" r="9" fill="#4fb36a"/>`,
  book: `<rect x="8" y="10" width="48" height="44" rx="4" fill="#d6453d" stroke="#8f2a24" stroke-width="2"/><rect x="14" y="10" width="42" height="40" fill="#fff4d6"/><rect x="8" y="10" width="7" height="44" fill="#a8322c"/><path d="M22 22h28M22 30h28M22 38h20" stroke="#b8a77a" stroke-width="2"/>`,
  bed: `<rect x="4" y="30" width="56" height="16" rx="3" fill="#8a5a33"/><rect x="4" y="16" width="6" height="40" fill="#8a5a33"/><rect x="10" y="26" width="50" height="12" rx="4" fill="#cfe0f7"/><rect x="12" y="20" width="16" height="9" rx="4" fill="#fff" stroke="#9db4d6"/><rect x="56" y="38" width="5" height="18" fill="#8a5a33"/>`,
  car: `<path d="M6 40v-8l8-3 8-10h20l8 10 8 3v8z" fill="#d6453d"/><path d="M24 22h16l5 8H19z" fill="#cfe8f5"/><circle cx="18" cy="42" r="7" fill="#17332c"/><circle cx="46" cy="42" r="7" fill="#17332c"/><circle cx="18" cy="42" r="3" fill="#ccc"/><circle cx="46" cy="42" r="3" fill="#ccc"/>`,
  egg: `<path d="M32 6c-14 0-22 22-22 32a22 22 0 0 0 44 0c0-10-8-32-22-32z" fill="#fff4e0" stroke="#c9b28a" stroke-width="2"/>`,
  cow: `<polygon points="14,18 8,6 20,14" fill="#f3dcc0"/><polygon points="50,18 56,6 44,14" fill="#f3dcc0"/><ellipse cx="12" cy="26" rx="7" ry="5" fill="#fff" stroke="#9a9a9a"/><ellipse cx="52" cy="26" rx="7" ry="5" fill="#fff" stroke="#9a9a9a"/><rect x="14" y="14" width="36" height="36" rx="14" fill="#fff" stroke="#9a9a9a" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="#333"/>${E(26, 30)}${E(40, 30)}<ellipse cx="32" cy="45" rx="13" ry="9" fill="#f4a3b6"/><circle cx="28" cy="45" r="1.8" fill="#17332c"/><circle cx="36" cy="45" r="1.8" fill="#17332c"/>`,
  duck: `<circle cx="30" cy="38" r="20" fill="#f7d34a"/><circle cx="34" cy="16" r="12" fill="#f7d34a"/><polygon points="42,16 58,19 42,23" fill="#e8781f"/>${E(36, 13)}<path d="M18 40q12 14 26 0" fill="#e8c030"/>`,
  milk: `<path d="M18 22l8-14h12l8 14v34H18z" fill="#fff" stroke="#6f93c9" stroke-width="2"/><rect x="18" y="28" width="28" height="18" fill="#cfe0f7"/><path d="M26 8h12" stroke="#6f93c9" stroke-width="2"/><circle cx="32" cy="37" r="6" fill="#fff"/>`,
};
