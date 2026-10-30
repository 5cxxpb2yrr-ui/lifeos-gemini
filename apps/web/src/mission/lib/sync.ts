import type { LifeData } from '../types';

/** table name -> LifeData section */
export const TABLES = { bill: 'bills', decision: 'decisions', loop: 'loops', person: 'people', insight: 'insights', project: 'projects', goal: 'goals' } as const;
export type Table = keyof typeof TABLES | 'kv';
export interface SyncRecord { table: Table; id: string; updatedAt: string; data: Record<string, unknown> }
export interface UiDoc { inbox: string[]; archive: string[]; weights: Record<string, number>; resolved: Record<string, string> }

const EPOCH = '1970-01-01T00:00:00.000Z';
const toIso = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' && Number.isFinite(v) ? new Date(v).toISOString() : undefined);
/** Record timestamp: updatedAt, else createdAt (real backups mix ISO strings and epoch numbers), else the epoch. */
export const stamp = (x: object) => { const o = x as Record<string, unknown>; return toIso(o.updatedAt) ?? toIso(o.createdAt) ?? EPOCH; };
const asRecord = (table: keyof typeof TABLES, x: { id: string | number }): SyncRecord => ({ table, id: String(x.id), updatedAt: stamp(x), data: x as unknown as Record<string, unknown> });

export function toRecords(d: LifeData): SyncRecord[] {
  return (Object.keys(TABLES) as (keyof typeof TABLES)[]).flatMap((t) => (d[TABLES[t]] as { id: string | number }[]).map((x) => asRecord(t, x)));
}

/**
 * Last write wins per record. Returns the merged data, whether anything changed locally,
 * and the local records the server is missing or has an older copy of. Nothing is deleted.
 */
export function merge(local: LifeData, remote: SyncRecord[]) {
  const byKey = new Map(remote.map((r) => [`${r.table}:${r.id}`, r]));
  const push: SyncRecord[] = [];
  const next: LifeData = { ...local };
  let changed = false;
  for (const t of Object.keys(TABLES) as (keyof typeof TABLES)[]) {
    const section = TABLES[t];
    const seen = new Set<string>();
    const items = (local[section] as { id: string | number }[]).map((x) => {
      const id = String(x.id);
      seen.add(id);
      const r = byKey.get(`${t}:${id}`);
      if (!r) { push.push(asRecord(t, x)); return x; }
      const mine = stamp(x);
      if (r.updatedAt > mine) { changed = true; return r.data as unknown as typeof x; }
      if (mine > r.updatedAt) push.push(asRecord(t, x));
      return x;
    });
    for (const r of remote) if (r.table === t && !seen.has(r.id)) { changed = true; items.push(r.data as unknown as { id: string }); }
    (next as unknown as Record<string, unknown>)[section] = items;
  }
  return { data: next, push, changed };
}

/** Inbox, archive, weights and snoozes sync as one document, newest copy wins. */
export function mergeUi(localAt: string, remote?: SyncRecord): { adopt: UiDoc | null; push: boolean } {
  if (!remote) return { adopt: null, push: localAt !== '' };
  if (remote.updatedAt > localAt) return { adopt: remote.data as unknown as UiDoc, push: false };
  return { adopt: null, push: localAt > remote.updatedAt };
}
