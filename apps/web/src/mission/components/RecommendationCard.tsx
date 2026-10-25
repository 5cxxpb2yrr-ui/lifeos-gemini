import type { Rec, Variant } from '../types';
import { band } from '../lib/scoring';
import { ScoreRing } from './ScoreRing';

const ACCENT: Record<Variant, string> = {
  default: 'border-[var(--line)]',
  decision: 'border-[#3B82F666]',
  risk: 'border-[#F59E0B66] shadow-[0_0_24px_#F59E0B22]',
  opportunity: 'border-[#22C55E55]',
  relationship: 'border-[#EF444455]',
};

export function RecommendationCard({ rec, variant = 'default', label, onAction, maxActions = 9, onLabel }: {
  rec: Rec; variant?: Variant; label?: string; onAction?: (id: string, action: string) => void; maxActions?: number; onLabel?: () => void;
}) {
  return (
    <article className={`rounded-[28px] border bg-[var(--surface-1)] p-3 transition duration-[180ms] hover:-translate-y-0.5 ${ACCENT[variant]}`}>
      {label && (onLabel
        ? <button onClick={onLabel} className="mb-2 block min-h-8 text-left text-xs font-semibold text-[var(--text-2)]">{label} ›</button>
        : <p className="mb-2 text-xs font-semibold text-[var(--text-2)]">{label}</p>)}
      <p className="text-xs text-[var(--text-3)]">{rec.entity}</p>
      <h3 className="text-base font-semibold leading-tight">{rec.title}</h3>
      {rec.context && <p className="text-[13px] text-[var(--text-2)]">{rec.context}</p>}
      {rec.recommendation && <p className="mt-1.5 text-[12.5px]"><span className="text-[var(--text-3)]">Recommendation · </span>{rec.recommendation}</p>}
      <div className="mt-2 flex gap-4"><ScoreRing label={`Impact · ${band(rec.impact)}`} value={rec.impact} /><ScoreRing label="Confidence" value={rec.confidence} suffix="%" color="#9fb0d0" /></div>
      <div className="mt-2 flex gap-2">
        {rec.actions.slice(0, maxActions).map((a, i) => (
          <button key={a} onClick={() => onAction?.(rec.id, a)}
            className={`min-h-11 flex-1 rounded-[20px] px-2 text-sm font-semibold transition duration-[120ms] hover:brightness-110 ${i === 0 ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'}`}>{a}</button>
        ))}
      </div>
    </article>
  );
}
