// Storage interface for child profiles (SCRUM-413). Device-only for now.
// Nothing here is sent to Firestore or any server. Google Drive app-data save comes later, behind a switch,
// and only after the legal-risk check and parent consent wording are done.
import type { ChildProfile } from '../profile/types';

export interface ProfileStorage {
  load(): ChildProfile[];
  save(profiles: ChildProfile[]): void;
}

const KEY = 'yaanstep-sprouts-profiles-v1';

export const deviceStorage: ProfileStorage = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as ChildProfile[]) : [];
    } catch {
      return [];
    }
  },
  save(profiles) {
    try {
      localStorage.setItem(KEY, JSON.stringify(profiles));
    } catch {
      // storage full or blocked: keep working in memory
    }
  },
};
