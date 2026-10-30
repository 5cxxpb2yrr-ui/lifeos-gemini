import { useState } from 'react';
import { CaptureChips } from './CaptureChips';
import { mentionsOf, parseCap } from '../lib/capture';
import type { Nav } from '../nav';
import { useStore } from '../store';
import { labelOf, type Goal, type Project } from '../types';
import { btn, btnP, field, lbl, row } from '../ui';

/** Sheet for a >project or ^goal: progress, and the captures that point at it. */
export function LinkSheet({ kind, item, nav }: { kind: 'project' | 'goal'; item: Project | Goal; nav: Nav }) {
  const { inbox, archive, data, setProgress } = useStore();
  const cur = kind === 'goal' ? (item as Goal).progress : (item as Project).completion;
  const [pct, setPct] = useState(typeof cur === 'number' ? String(cur) : '');
  const pool = kind === 'goal' ? data.goals : data.projects;
  const mentions = mentionsOf([...inbox, ...archive], kind === 'goal' ? 'goal' : 'proj', pool, item.id);
  const meta = [kind === 'goal' ? 'Goal' : 'Project', kind === 'goal' ? (item as Goal).level : (item as Project).category, (item as Project).status].filter(Boolean).join(' · ');
  const name = labelOf(item);
  const shown = typeof cur === 'number' ? Math.max(0, Math.min(100, cur)) : null;
  return (
    <div>
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-sm text-[var(--text-2)]">{meta}</p>
      {shown !== null && <><div className="mt-3 h-2 overflow-hidden rounded bg-[#26334f]"><i className="block h-full bg-[var(--blue)]" style={{ width: `${shown}%` }} /></div><p className="mt-1 text-xs text-[var(--text-2)]">{shown}% {kind === 'goal' ? 'progress' : 'complete'}</p></>}
      <h4 className={lbl}>{kind === 'goal' ? 'Progress' : 'Percent complete'} (0–100)</h4>
      <input className={field} type="number" min={0} max={100} inputMode="numeric" value={pct} onChange={(e) => setPct(e.target.value)} />
      <h4 className={lbl}>Captures pointing here</h4>
      {mentions.length ? mentions.map((t, i) => <div key={i} className={row}><span>{parseCap(t).text || t}<CaptureChips parsed={parseCap(t)} people={data.people} projects={data.projects} goals={data.goals} /></span></div>) : <p className="text-sm text-[var(--text-2)]">None yet. Try {kind === 'goal' ? '^' : '>'}{name.split(' ')[0].toLowerCase()} in Capture.</p>}
      <div className="mt-3 flex gap-2">
        <button disabled={pct === '' || Number.isNaN(Number(pct))} onClick={() => setProgress(kind, String(item.id), Math.max(0, Math.min(100, Number(pct))))} className={`${btnP} flex-1 disabled:opacity-50`}>Save</button>
        <button onClick={nav.pop} className={`${btn} flex-1`}>‹ Back</button>
      </div>
    </div>
  );
}
