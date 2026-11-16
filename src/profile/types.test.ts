import { describe, it, expect } from 'vitest';
import { isValidNickname, AGE_BANDS } from './types';

describe('child profile rules', () => {
  it('accepts a normal nickname', () => expect(isValidNickname('Sunny')).toBe(true));
  it('rejects empty or blank nicknames', () => {
    expect(isValidNickname('')).toBe(false);
    expect(isValidNickname('   ')).toBe(false);
  });
  it('rejects nicknames over 20 characters', () => expect(isValidNickname('x'.repeat(21))).toBe(false));
  it('has five age bands covering 3 to 12', () => expect(AGE_BANDS).toHaveLength(5));
});
