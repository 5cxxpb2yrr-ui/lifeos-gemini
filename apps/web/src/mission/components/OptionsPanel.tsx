import { useState } from 'react';
import { optionScore, rankOptions } from '../lib/scoring';
import type { Nav } from '../nav';
import { useStore } from '../store';
import type { Decision } from '../types';
import { btn, btnP, field, lbl, row } from '../ui';

export function OptionsPanel({ decision, nav }: { decision: Decision; nav: Nav }) {
  const choose = useStore((s) => s.choose);
  const opts = decision.options ?? [];
  return (
    <div>
      <h4 className={lbl}>Options</h4>
      {rankOptions(opts).map((o, n) => (
        <div key={o.name} className={row}>
          <span>{n === 0 ? '★ ' : ''}{o.name}<span className="block text-xs text-[var(--text-2)]">Value {o.value} · Safety {o.safety} · Fit {o.fit}</span></span>
          <span className="flex items-center gap-2"><b>{optionScore(o)}</b><button onClick={() => { choose(decision.id, opts.indexOf(o)); nav.close(); }} className={`${btn} min-h-10`}>Choose</button></span>
        </div>
      ))}
      {!opts.length && <p className="text-sm text-[var(--text-2)]">No options yet. Add two or more to get a recommendation.</p>}
      <button onClick={() => nav.push({ kind: 'option', id: decision.id })} className={`${btn} mt-2 w-full`}>Add option</button>
    </div>
  );
}

export function OptionForm({ decision, nav }: { decision: Decision; nav: Nav }) {
  const addOption = useStore((s) => s.addOption);
  const [name, setName] = useState('');
  const [r, setR] = useState({ value: 3, safety: 3, fit: 3 });
  const sel = (k: keyof typeof r, label: string) => (
    <div key={k}><h4 className={lbl}>{label} (1–5)</h4>
      <select className={field} value={r[k]} onChange={(e) => setR({ ...r, [k]: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></div>
  );
  return (
    <div>
      <h2 className="text-xl font-semibold">Add option</h2>
      <input className={`${field} mt-3`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PPO plan" aria-label="Option name" />
      {sel('value', 'Value')}{sel('safety', 'Safety, higher is safer')}{sel('fit', 'Fit')}
      <div className="mt-3 flex gap-2">
        <button disabled={!name.trim()} onClick={() => { addOption(decision.id, { name: name.trim(), ...r }); nav.pop(); }} className={`${btnP} flex-1 disabled:opacity-50`}>Save option</button>
        <button onClick={nav.pop} className={`${btn} flex-1`}>‹ Back</button>
      </div>
    </div>
  );
}
