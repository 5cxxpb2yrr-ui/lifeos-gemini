import { useState } from 'react';
import { exportBackup } from '../lib/ledger';
import type { Weights } from '../lib/scoring';
import { useStore } from '../store';
import { btn, card } from '../ui';
import type { ViewName } from './Views';

const ROWS: [keyof Weights, string][] = [['urgency', 'Urgency'], ['exposure', 'Exposure'], ['consequence', 'Consequence'], ['completeness', 'Data completeness'], ['freshness', 'Freshness']];
const VIEWS: [ViewName, string][] = [['health', 'System check'], ['agenda', 'Agenda'], ['context', 'People'], ['memory', 'Memory']];

export function More({ onView }: { onView: (v: ViewName) => void }) {
  const { weights, setWeight, resetWeights, data, inbox, archive, importBackup, resetData } = useStore();
  const [note, setNote] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(exportBackup(data), null, 1)); setNote('Export copied'); } catch { setNote('Clipboard blocked in this browser'); }
  };
  const load = async (f?: File) => {
    if (!f) return;
    try { setNote(importBackup(JSON.parse(await f.text())) ? 'Imported' : 'No bills found in that file'); } catch { setNote('Could not read that file'); }
  };
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">More</h2>
      <div className={`${card} mb-3`}>
        <h3 className="font-semibold">Views</h3><p className="text-xs text-[var(--text-2)]">Secondary views. Mission stays a single briefing.</p>
        <div className="mt-2 grid grid-cols-2 gap-2">{VIEWS.map(([k, l]) => <button key={k} onClick={() => onView(k)} className={btn}>{l}</button>)}</div>
      </div>
      <div className={`${card} mb-3`}>
        <h3 className="font-semibold">Scoring weights</h3>
        <p className="text-xs text-[var(--text-2)]">Impact and confidence are computed from these. Each group is normalized to 100%.</p>
        {ROWS.map(([k, label]) => (
          <label key={k} className="flex min-h-11 items-center justify-between border-t border-[var(--line)] text-sm">{label}
            <input type="number" min={0} max={100} inputMode="numeric" value={Math.round(weights[k] * 100)} onChange={(e) => setWeight(k, Number(e.target.value))} className="w-20 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-1.5 text-right" />
          </label>
        ))}
        <button onClick={resetWeights} className={`${btn} mt-2 w-full`}>Reset weights</button>
      </div>
      <div className={card}>
        <h3 className="font-semibold">Your data</h3>
        <p className="text-xs text-[var(--text-2)]">{data.bills.length} bills · {data.loops.length} loops · {data.people.length} people · {inbox.length} inbox · {archive.length} archived</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className={`${btn} grid cursor-pointer place-items-center`}>Import backup<input type="file" accept=".json,application/json" hidden onChange={(e) => load(e.target.files?.[0])} /></label>
          <button onClick={copy} className={btn}>Copy export</button>
        </div>
        <button onClick={resetData} className={`${btn} mt-2 w-full`}>Reset to seed data</button>
        {note && <p className="mt-1.5 text-xs text-[var(--text-2)]">{note}</p>}
      </div>
    </section>
  );
}
