import type { Progress } from './points.ts';
// One interface; puzzle and points code never know where progress lives.
export interface ProgressStore {
  readonly kind: 'device' | 'drive-appdata' | 'firestore-test' | 'save-code';
  load(childId: string): Promise<Progress | null>;
  save(childId: string, p: Progress): Promise<void>;
}
export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }
export class DeviceStore implements ProgressStore {
  readonly kind = 'device' as const;
  private kv: KV;
  constructor(kv: KV) { this.kv = kv; }
  async load(id: string) { const v = this.kv.getItem('sprouts:' + id); return v ? (JSON.parse(v) as Progress) : null; }
  async save(id: string, p: Progress) { this.kv.setItem('sprouts:' + id, JSON.stringify(p)); }
}
// Cloud stores stay OFF for real children until the legal-risk check and consent wording are done.
export const CLOUD_SAVE_ENABLED_FOR_CHILDREN = false;
export function chooseStore(device: ProgressStore, cloud: ProgressStore | null, parentConsent: boolean, isTestAccount: boolean): ProgressStore {
  if (cloud && CLOUD_SAVE_ENABLED_FOR_CHILDREN && parentConsent) return cloud;
  if (cloud && isTestAccount && cloud.kind === 'firestore-test') return cloud;
  return device;
}
