import { create } from 'zustand';
import { merge, mergeUi, type SyncRecord, type UiDoc } from './lib/sync';
import { useStore } from './store';
import { pull, push } from './syncClient';

export const useSyncStatus = create<{ state: 'off' | 'idle' | 'syncing' | 'error'; message: string }>(() => ({ state: 'off', message: 'Sync is off' }));
let running = false;
let applying = false;

/** Pull, merge by timestamp, apply, then push whatever the server is missing. */
export async function syncNow(): Promise<void> {
  const cfg = useStore.getState().sync;
  if (!cfg.url || !cfg.token) { useSyncStatus.setState({ state: 'off', message: 'Sync is off' }); return; }
  if (running) return;
  running = true;
  useSyncStatus.setState({ state: 'syncing', message: 'Syncing…' });
  try {
    const { records } = await pull(cfg);
    // Merge against the latest local state (no awaits between reading and applying), so edits made during the request are kept.
    const s = useStore.getState();
    const m = merge(s.data, records.filter((r) => r.table !== 'kv'));
    const uiRemote = records.find((r) => r.table === 'kv' && r.id === 'ui');
    const mu = mergeUi(s.uiAt, uiRemote);
    const out: SyncRecord[] = [...m.push];
    if (mu.push) out.push({ table: 'kv', id: 'ui', updatedAt: s.uiAt, data: { inbox: s.inbox, archive: s.archive, weights: s.weights, resolved: s.resolved } });
    if (m.changed || mu.adopt) {
      applying = true;
      try {
        useStore.setState({ data: m.data, ...(mu.adopt && uiRemote ? { inbox: mu.adopt.inbox, archive: mu.adopt.archive, weights: mu.adopt.weights as never, resolved: mu.adopt.resolved, uiAt: uiRemote.updatedAt } : {}) });
      } finally { applying = false; }
    }
    if (out.length) await push(cfg, out);
    useSyncStatus.setState({ state: 'idle', message: `Synced ${new Date().toLocaleTimeString()}` });
  } catch (e) {
    useSyncStatus.setState({ state: 'error', message: e instanceof Error ? e.message : 'Sync failed' });
  } finally { running = false; }
}

/** Sync on start, on return to the app, when back online, and shortly after any local change. */
export function startSync(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const soon = () => { clearTimeout(timer); timer = setTimeout(() => void syncNow(), 2000); };
  const unsub = useStore.subscribe((s, p) => { if (!applying && (s.data !== p.data || s.uiAt !== p.uiAt || s.sync !== p.sync)) soon(); });
  const visible = () => { if (document.visibilityState === 'visible') void syncNow(); };
  document.addEventListener('visibilitychange', visible);
  window.addEventListener('online', soon);
  void syncNow();
  return () => { clearTimeout(timer); unsub(); document.removeEventListener('visibilitychange', visible); window.removeEventListener('online', soon); };
}
export type { UiDoc };
