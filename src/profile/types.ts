// A child profile holds a nickname, an age band and a picture avatar only.
// No real name, no photo, no birth date (Project instructions).
export const AGE_BANDS = ['3-4', '5-6', '7-8', '9-10', '11-12'] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const AVATARS = ['🐻', '🦊', '🐼', '🐸', '🦉', '🐙', '🦄', '🐢'] as const;
export type Avatar = (typeof AVATARS)[number];

export interface ChildProfile {
  id: string;
  nickname: string;
  ageBand: AgeBand;
  avatar: Avatar;
}

export function isValidNickname(s: string): boolean {
  const t = s.trim();
  return t.length >= 1 && t.length <= 20;
}
