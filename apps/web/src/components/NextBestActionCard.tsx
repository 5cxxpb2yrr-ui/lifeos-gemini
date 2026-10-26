import { ChevronRight, Sparkles } from 'lucide-react';
import type { Recommendation } from '@lifeos/domain';
import { lifeosTheme as t } from '@lifeos/shared';

interface Props {
  recommendation: Recommendation;
  onAction?: (action: string) => void;
  sample?: boolean;
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <span className="text-xs" style={{ color: t.colors.textSecondary }}>{label}</span>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-3 rounded-xl border border-white/5 bg-black/20 p-3">
      <p className="mb-1 text-xs font-semibold" style={{ color: '#93C5FD' }}>{title}</p>
      <p className="text-xs" style={{ color: t.colors.textSecondary }}>{body}</p>
    </div>
  );
}

export function NextBestActionCard({ recommendation: r, onAction, sample = false }: Props) {
  const actionDisabled = !onAction;

  return (
    <section
      className="relative mb-6 overflow-hidden border p-6 backdrop-blur-xl"
      style={{
        borderRadius: t.radii.card,
        borderColor: 'rgba(59,130,246,0.6)',
        background: 'linear-gradient(to bottom, #0B2447, #06111F)',
        boxShadow: t.glows.hero,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{ color: t.colors.electricBlue }}
        >
          <Sparkles size={14} /> Next Best Action{sample ? ' · Sample' : ''}
        </span>
        <span
          className="flex items-center gap-0.5 border px-3 py-1 text-xs"
          style={{
            color: '#93C5FD',
            borderRadius: t.radii.badge,
            borderColor: 'rgba(59,130,246,0.3)',
            background: 'rgba(59,130,246,0.2)',
          }}
        >
          High Impact <ChevronRight size={12} />
        </span>
      </div>

      {sample && <p className="mb-3 text-xs" style={{ color: t.colors.textSecondary }}>Example recommendation, not live account data.</p>}

      <h2 className="text-xl font-bold" style={{ color: t.colors.textPrimary }}>{r.title}</h2>
      <p className="mb-4 text-sm" style={{ color: t.colors.textSecondary }}>{r.recommendation}</p>

      <div className="mb-4 flex gap-6">
        <Metric label="Impact" value={String(r.impactScore)} color={t.colors.fireAmber} />
        <Metric label="Confidence" value={`${r.confidenceScore}%`} color={t.colors.electricBlue} />
      </div>

      <Panel title="Expected Outcome" body={r.expectedOutcome} />
      <Panel title="Why This Matters" body={r.whyThisMatters} />

      <div className="mt-6 flex gap-3">
        {r.actions.map((a, i) => (
          <button
            key={a}
            type="button"
            onClick={() => onAction?.(a)}
            disabled={actionDisabled}
            title={actionDisabled ? 'Not connected yet' : undefined}
            className="flex-1 py-3 text-sm font-semibold text-white transition active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderRadius: t.radii.button,
              background: i === 0 ? t.colors.electricBlueGlow : 'rgba(255,255,255,0.1)',
              border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {a}
          </button>
        ))}
      </div>
    </section>
  );
}
