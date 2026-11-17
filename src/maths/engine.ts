// The plug-in point for the shared maths core (SCRUM-409 / SCRUM-451).
// The real puzzle generator, lessons, points and streak come from the maths author chat's TypeScript source
// (to be placed in src/maths/). Until it arrives, the app uses the placeholder below so screens can be built and tested.
// Do NOT write puzzle rules here: they must live in one place only.
import type { AgeBand } from '../profile/types';

export interface Chapter {
  id: string;
  title: string;
}

export interface MathsEngine {
  chaptersFor(band: AgeBand): Chapter[];
}

// PLACEHOLDER: not real chapters, not for children. Replaced by the shared maths source.
export const placeholderEngine: MathsEngine = {
  chaptersFor(band) {
    return [1, 2, 3].map((n) => ({ id: `${band}:placeholder:${n}`, title: `Placeholder chapter ${n}` }));
  },
};
