import { OptionsPanel } from './OptionsPanel';
import { ScoreRing } from './ScoreRing';
import { band, share } from '../lib/scoring';
import { getLinkedGoals, getLinkedProjects } from '../lib/linker';
import type { Nav } from '../nav';
import { useStore } from '../store';
import type { LifeData, Rec } from '../types';
import { btn, btnP } from '../ui';

export function ItemDetail({ rec, data, nav, onAct }: { rec: Rec; data: LifeData; nav: Nav; onAct: (r: Rec, a: string) => void }) {
  const { snoozeItem, weights: w } = useStore();
  const dec = rec.ref?.type === 'decision' ? data.decisions.find((d) => d.id === rec.ref?.id) : undefined;
  const linkedProjects = rec.ref ? getLinkedProjects(data, rec.ref.type, rec.ref.id) : [];
  const linkedGoals = rec.ref ? getLinkedGoals(data, rec.ref.type, rec.ref.id) : [];
  const fact = (label: string, text?: string) => (text ? <p className="mt-2 text-sm"><span className="block text-xs text-[var(--text-2)]">{label}</span>{text}</p> : null);
  return (
    <div>
      <h2 className="text-xl font-semibold">{rec.title}</h2>
      {rec.context && <p className="text-sm text-[var(--text-2)]">{rec.context}</p>}
      <div className="mt-2 flex gap-4"><ScoreRing label={`Impact · ${band(rec.impact)}`} value={rec.impact} /><ScoreRing label="Confidence" value={rec.confidence} suffix="%" color="#9fb0d0" /></div>
      {(linkedProjects.length || linkedGoals.length) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {linkedProjects.map((project) => (
            <span key={project.id} className="rounded-full border border-[#3B82F666] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--blue)]">&gt;{project.title}</span>
          ))}
          {linkedGoals.map((goal) => (
            <span key={goal.id} className="rounded-full border border-[#F59E0B66] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--risk)]">^{goal.title}</span>
          ))}
        </div>
      )}
      {fact('Recommendation', rec.recommendation)}{fact('Expected outcome', rec.outcome)}{fact('Why this matters', rec.why)}
      {dec && <OptionsPanel decision={dec} nav={nav} />}
      {rec.factors && (
        <details className="mt-3 rounded-xl border border-[var(--line)] p-2">
          <summary className="cursor-pointer text-sm font-semibold">Why this score <span className="ml-2 text-xs font-normal text-[var(--text-2)]">Impact {rec.impact} · Confidence {rec.confidence}%</span></summary>
          {rec.factors.map(([l, v]) => (
            <div key={l} className="mt-2"><p className="text-xs text-[var(--text-2)]">{l} · {Math.round(v * 100)}%</p><div className="h-1.5 overflow-hidden rounded bg-[#26334f]"><i className="block h-full rounded bg-[var(--blue)]" style={{ width: `${Math.round(v * 100)}%` }} /></div></div>
          ))}
          <p className="mt-2 text-xs text-[var(--text-2)]">Impact = {share(w, 'urgency')}% urgency + {share(w, 'exposure')}% exposure + {share(w, 'consequence')}% consequence. Confidence = {share(w, 'completeness')}% data completeness + {share(w, 'freshness')}% freshness.</p>
        </details>
      )}
      <div className="mt-3 flex gap-2">{rec.actions.map((a, i) => <button key={a} onClick={() => onAct(rec, a)} className={`${i === 0 ? btnP : btn} flex-1`}>{a}</button>)}</div>
      <button onClick={() => { snoozeItem(rec.id); nav.close(); }} className={`${btn} mt-2 w-full`}>Snooze 1 day</button>
    </div>
  );
}
