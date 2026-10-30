import { useState } from 'react';
import { useStore } from '../store';
import { syncNow, useSyncStatus } from '../syncRunner';
import { btn, btnP, card, field } from '../ui';

export function SyncCard() {
  const { sync, setSync } = useStore();
  const status = useSyncStatus();
  const [url, setUrl] = useState(sync.url);
  const [token, setToken] = useState(sync.token);
  return (
    <div className={`${card} mb-3`}>
      <h3 className="font-semibold">Sync between devices</h3>
      <p className="text-xs text-[var(--text-2)]">Optional. Point this at your LifeOS API (HTTPS) and enter its token. Without it, data stays on this device.</p>
      <input className={`${field} mt-2`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-api.example.com" aria-label="API URL" autoCapitalize="none" autoCorrect="off" />
      <input className={`${field} mt-2`} type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="API token" aria-label="API token" autoComplete="off" />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button className={btnP} onClick={() => { setSync({ url, token }); void syncNow(); }}>Save and sync</button>
        <button className={btn} onClick={() => { setUrl(''); setToken(''); setSync({ url: '', token: '' }); useSyncStatus.setState({ state: 'off', message: 'Sync is off' }); }}>Turn off</button>
      </div>
      <p className="mt-1.5 text-xs" style={{ color: status.state === 'error' ? 'var(--critical)' : 'var(--text-2)' }}>{sync.url ? status.message : 'Sync is off'}</p>
    </div>
  );
}
