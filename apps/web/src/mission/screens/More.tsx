import { useState } from 'react';
import { exportBackup } from '../lib/ledger';
import type { Weights } from '../lib/scoring';
import { useStore } from '../store';
import { btn, card } from '../ui';
import type { ViewName } from './Views';

const ROWS: [keyof Weights, string][] = [['urgency', 'Urgency'], ['exposure', 'Exposure'], ['consequence', 'Consequence'], ['completeness', 'Data completeness'], ['freshness', 'Freshness']];
const VIEWS: [ViewName, string][] = [['health', 'System check'], ['agenda', 'Agenda'], ['context', 'People'], ['memory', 'Memory']];

export function More({ onView }: { onView: (v: ViewName) => void }) {
  const { weights, setWeight, resetWeights, data, inbox, archive, importBackup, resetData, createProject, createGoal } = useStore();
  const [note, setNote] = useState('');
  const [projectName, setProjectName] = useState('');
  const [goalName, setGoalName] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(exportBackup(data), null, 1)); setNote('Export copied'); } catch { setNote('Clipboard blocked in this browser'); }
  };
  const load = async (f?: File) => {
    if (!f) return;
    try { setNote(importBackup(JSON.parse(await f.text())) ? 'Imported' : 'No bills found in that file'); } catch { setNote('Could not read that file'); }
  };
  const addProject = () => {
    const title = projectName.trim();
    if (!title) return;
    createProject(title);
    setProjectName('');
    setNote('Project created');
  };
  const addGoal = () => {
    const title = goalName.trim();
    if (!title) return;
    createGoal(title);
    setGoalName('');
    setNote('Goal created');
  };
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">More</h2>
      <div className={`${card} mb-3`}>
        <h3 className="font-semibold">Views</h3><p className="text-xs text-[var(--text-2)]">Secondary views. Mission stays a single briefing.</p>
        <div className="mt-2 grid grid-cols-2 gap-2">{VIEWS.map(([k, l]) => <button key={k} onClick={() => onView(k)} className={btn}>{l}</button>)}</div>
      </div>
      <div className={`${card} mb-3`}>
        <h3 className="font-semibold">Projects & goals</h3>
        <p className="text-xs text-[var(--text-2)]">Keep strategic work visible and linked to your operational actions.</p>
        <div className="mt-3 grid gap-2">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2">
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-2)]"><span>PROJECTS</span><span>{data.projects.length}</span></div>
            <div className="flex gap-2">
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Front suspension refresh" className="min-h-10 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 text-sm" />
              <button onClick={addProject} className={btn}>Add</button>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2">
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-2)]"><span>GOALS</span><span>{data.goals.length}</span></div>
            <div className="flex gap-2">
              <input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Reach $150k net worth" className="min-h-10 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 text-sm" />
              <button onClick={addGoal} className={btn}>Add</button>
            </div>
          </div>
        </div>
      </div>
      <div className={`${card} mb-3`}>
        <h3 className="font-semibold">Scoring weights</h3>
        <p className="text-xs text-[var(--text-2)]">Impact and confidence are computed from these. Each group is normalized to 100%.</p>
        {ROWS.map(([k, label]) => (
          <label key={k} className="flex min-h-11 items-center justify-between border-t border-[var(--line)] text-sm">{label}
            <input type="number" min={0} max={100} inputMode="numeric" value={Math.round(weights[k] * 100)} onChange={(e) => setWeight(k, Number(e.target.value))} className="w-20 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-right" />
          </label>
        ))}
        <button onClick={resetWeights} className={`${btn} mt-2 w-full`}>Reset weights</button>
      </div>
      <div className={card}>
        <h3 className="font-semibold">Your data</h3>
        <p className="text-xs text-[var(--text-2)]">{data.bills.length} bills · {data.loops.length} loops · {data.people.length} people · {data.projects.length} projects · {data.goals.length} goals · {inbox.length} inbox · {archive.length} archived</p>
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

