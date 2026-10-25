import type { Rec } from '../types';
import { band } from '../lib/scoring';
import { ScoreRing } from './ScoreRing';

export function NextBestActionCard({ rec, onAction }: { rec: Rec; onAction?: (id: string, action: string) => void }) {
  return (
    <section className="rounded-[28px] border border-[#3B82F680] bg-gradient-to-b from-[#12244a] to-[var(--surface-1)] p-4 shadow-[0_0_32px_#3B82F640]">
      <header className="mb-2 flex justify-between text-xs font-semibold text-[var(--blue)]">
        <span>✦ NEXT BEST ACTION</span><span>{band(rec.impact)} impact ›</span>
      </header>
      <p className="text-xs text-[var(--text-3)]">{rec.entity}</p>
      <h2 className="text-xl font-semibold">{rec.title}</h2>
      {rec.context && <p className="text-sm text-[var(--text-2)]">{rec.context}</p>}
      <div className="mt-2 flex gap-4"><ScoreRing label={`Impact · ${band(rec.impact)}`} value={rec.impact} /><ScoreRing label="Confidence" value={rec.confidence} suffix="%" color="#9fb0d0" /></div>
      {rec.outcome && <p className="mt-3 text-sm"><span className="block text-xs text-[var(--text-2)]">Expected outcome</span>{rec.outcome}</p>}
      {rec.why && <p className="mt-2 text-sm"><span className="block text-xs text-[var(--text-2)]">Why this matters</span>{rec.why}</p>}
      <div className="mt-3 flex gap-2">
        {rec.actions.map((a, i) => (
          <button key={a} onClick={() => onAction?.(rec.id, a)}
            className={`min-h-11 flex-1 rounded-[20px] px-3 text-sm font-semibold transition duration-[120ms] hover:brightness-110 ${i === 0 ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'}`}>{a}</button>
        ))}
      </div>
    </section>
  );
}
