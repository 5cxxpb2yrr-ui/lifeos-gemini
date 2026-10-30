import type { SyncRecord } from './lib/sync';
import type { SyncConfig } from './store';

const base = (u: string) => u.replace(/\/+$/, '');

async function call<T>(cfg: SyncConfig, path: string, init: RequestInit): Promise<T> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(base(cfg.url) + path, { ...init, signal: ctl.signal, headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.token}` } });
    if (r.status === 401) throw new Error('Wrong token');
    if (!r.ok) throw new Error(`Server error ${r.status}`);
    return (await r.json()) as T;
  } finally { clearTimeout(timer); }
}

export const pull = (cfg: SyncConfig) => call<{ records: SyncRecord[] }>(cfg, '/api/records', { method: 'GET' });
export async function push(cfg: SyncConfig, records: SyncRecord[]) {
  for (let i = 0; i < records.length; i += 500) await call(cfg, '/api/records', { method: 'PUT', body: JSON.stringify({ records: records.slice(i, i + 500) }) });
}
