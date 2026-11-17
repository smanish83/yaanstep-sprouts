import { describe, it, expect } from 'vitest';
import { placeholderEngine } from './engine';
import { AGE_BANDS } from '../profile/types';

describe('placeholder maths engine', () => {
  it('returns chapters for every age band', () => {
    for (const band of AGE_BANDS) expect(placeholderEngine.chaptersFor(band).length).toBeGreaterThan(0);
  });
  it('gives each chapter a unique id', () => {
    const ids = AGE_BANDS.flatMap((b) => placeholderEngine.chaptersFor(b).map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
