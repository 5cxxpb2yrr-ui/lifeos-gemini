import { useState } from 'react';
import { money } from '../lib/dates';
import { balanceSeries } from '../lib/loans';
import type { Bill } from '../types';

/** Subordinate chart: tap a point to drill into that payment. */
export function BalanceChart({ bill }: { bill: Bill }) {
  const [sel, setSel] = useState<number | null>(null);
  const { payments, values } = balanceSeries(bill);
  if (!payments.length) return null;
  const W = 300, H = 80, mx = Math.max(...values, 1);
  const X = (i: number) => 10 + (i * (W - 20)) / Math.max(values.length - 1, 1);
  const Y = (n: number) => 8 + (H - 16) * (1 - n / mx);
  const text = sel === null ? 'Tap a point to see that payment.' : sel === 0 ? `Starting balance ${money(values[0])}` : `${payments[sel - 1].date.slice(0, 10)} · paid ${money(payments[sel - 1].amount)} → balance ${money(values[sel])}`;
  return (
    <div>
      <h4 className="mb-1 mt-3 text-xs font-semibold text-[var(--text-2)]">Balance over time</h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Balance over time">
        <polyline fill="none" stroke="#3B82F6" strokeWidth="2" points={values.map((n, i) => `${X(i)},${Y(n)}`).join(' ')} />
        {values.map((n, i) => (
          <g key={i} onClick={() => setSel(i)}>
            <circle cx={X(i)} cy={Y(n)} r="10" fill="#3B82F6" fillOpacity={sel === i ? 0.45 : 0.2} />
            <circle cx={X(i)} cy={Y(n)} r="3" fill="#3B82F6" />
          </g>
        ))}
      </svg>
      <p className="text-xs text-[var(--text-2)]">{text}</p>
    </div>
  );
}
