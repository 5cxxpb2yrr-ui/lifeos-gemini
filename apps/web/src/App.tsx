import { useMemo, useState } from 'react';
import { filterOpenLoops, resolveOpenLoops } from '@lifeos/domain';
import type { OpenLoopSourceRecord, OpenLoopTiming, Recommendation } from '@lifeos/domain';
import { lifeosTheme as t } from '@lifeos/shared';
import { NextBestActionCard } from './components/NextBestActionCard';

// Illustrative fixtures only. These are not connected to real LifeOS records.
const demoNow = new Date();
const hoursFromNow = (hours: number) => new Date(demoNow.getTime() + hours * 60 * 60 * 1000).toISOString();
const demoOpenLoops: OpenLoopSourceRecord[] = [
  { id: 'demo-task-1', type: 'task', title: 'Review utility transfer checklist', status: 'ACTIVE', createdAt: hoursFromNow(-96), updatedAt: hoursFromNow(-8), dueAt: hoursFromNow(-5), priority: 'high', linkedEntityIds: ['demo-move'] },
  { id: 'demo-question-1', type: 'question', title: 'Confirm the next bill due date', status: 'WAITING', createdAt: hoursFromNow(-48), updatedAt: hoursFromNow(-2), dueAt: hoursFromNow(20), priority: 'urgent', linkedEntityIds: ['demo-bill'] },
  { id: 'demo-follow-up-1', type: 'follow_up', title: 'Follow up on service transfer', status: 'ACTIVE', createdAt: hoursFromNow(-24), updatedAt: hoursFromNow(-1), nextActionAt: hoursFromNow(52), priority: 'normal', linkedEntityIds: ['demo-move'] },
  { id: 'demo-risk-1', type: 'risk', title: 'Check for any move-day gaps', status: 'BLOCKED', createdAt: hoursFromNow(-120), updatedAt: hoursFromNow(-12), priority: 'high', linkedEntityIds: ['demo-move'] },
  { id: 'demo-event-1', type: 'event_follow_up', title: 'Send meeting follow-up', status: 'ACTIVE', createdAt: hoursFromNow(-30), updatedAt: hoursFromNow(-3), dueAt: hoursFromNow(12), priority: 'normal', requiresFollowUp: true },
  { id: 'demo-event-ignored', type: 'event_follow_up', title: 'Ordinary event (not a follow-up)', status: 'ACTIVE', createdAt: hoursFromNow(-10), updatedAt: hoursFromNow(-1), dueAt: hoursFromNow(5), requiresFollowUp: false },
  { id: 'demo-complete', type: 'task', title: 'Completed sample (excluded)', status: 'COMPLETE', createdAt: hoursFromNow(-72), updatedAt: hoursFromNow(-30), dueAt: hoursFromNow(-20) },
];

const nba: Recommendation = {
  id: 'rec-1',
  entityId: 'property-1',
  title: 'Contact Georgia Power',
  category: 'execute_now',
  recommendation: 'regarding service transfer.',
  whyThisMatters: 'Your move date is in 6 days. No transfer request is currently open.',
  expectedOutcome: 'Prevent utility interruption for your upcoming move and avoid late fees.',
  impactScore: 92,
  confidenceScore: 88,
  urgencyScore: 90,
  actions: ['Call Now', 'Start Online'],
};

const filters: { label: string; value: OpenLoopTiming | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Next 72h', value: 'next_72_hours' },
  { label: 'Later', value: 'later' },
  { label: 'No date', value: 'no_due_date' },
];

const timingLabel: Record<OpenLoopTiming, string> = {
  overdue: 'OVERDUE',
  next_72_hours: 'NEXT 72 HOURS',
  later: 'LATER',
  no_due_date: 'NO DUE DATE',
};
const timingColor: Record<OpenLoopTiming, string> = {
  overdue: '#F59E0B',
  next_72_hours: '#60A5FA',
  later: '#94A3B8',
  no_due_date: '#C084FC',
};
const typeLabel: Record<OpenLoopSourceRecord['type'], string> = {
  task: 'Task',
  question: 'Question',
  follow_up: 'Follow-up',
  risk: 'Risk',
  commitment: 'Commitment',
  event_follow_up: 'Event follow-up',
};

export default function App() {
  const [timingFilter, setTimingFilter] = useState<OpenLoopTiming | 'all'>('all');
  const today = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const resolved = useMemo(() => resolveOpenLoops(demoOpenLoops, demoNow), []);
  const visibleItems = useMemo(
    () => filterOpenLoops(resolved, { timing: timingFilter }),
    [resolved, timingFilter],
  );

  return (
    <div className="min-h-screen px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: t.colors.bgCanvas, color: t.colors.textPrimary }}>
      <div className="mx-auto max-w-md">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-wide">LifeOS</h1>
            <p className="text-xs" style={{ color: t.colors.textSecondary }}>Mission Control</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-sm font-medium">
              <span className="h-2 w-2 rounded-full" style={{ background: '#60A5FA' }} />
              Preview mode
            </p>
            <p className="text-xs" style={{ color: t.colors.textMuted }}>{today}</p>
          </div>
        </header>

        <div className="mb-4 rounded-xl border px-3 py-2.5 text-xs" style={{ borderColor: '#F59E0B66', background: '#F59E0B12', color: '#FCD34D' }}>
          SAMPLE DATA ONLY · Not connected to your records or financial accounts.
        </div>

        <NextBestActionCard recommendation={nba} onAction={(a) => console.log('Preview action:', a)} />

        <section className="mt-5 rounded-2xl border p-4" style={{ borderColor: '#3B82F655', background: 'linear-gradient(145deg, #111827, #0D1119)', boxShadow: '0 0 28px #2563EB12' }}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#60A5FA' }}>System Load</p>
              <h2 className="mt-1 text-lg font-bold">Open Loops</h2>
              <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Resolved by the domain engine · illustrative fixtures</p>
            </div>
            <div className="rounded-xl border px-3 py-2 text-center" style={{ borderColor: '#3B82F666', background: '#1D4ED822' }}>
              <p className="text-2xl font-bold tabular-nums">{resolved.totalOpen}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#93C5FD' }}>Open</p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <Metric label="Overdue" value={resolved.overdueCount} color="#F59E0B" />
            <Metric label="Next 72h" value={resolved.dueWithin72HoursCount} color="#60A5FA" />
            <Metric label="No due date" value={resolved.noDueDateCount} color="#C084FC" />
          </div>

          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const active = timingFilter === filter.value;
              return (
                <button key={filter.value} type="button" onClick={() => setTimingFilter(filter.value)}
                  className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{ borderColor: active ? '#60A5FA' : '#334155', background: active ? '#1D4ED8' : '#111827', color: active ? '#FFFFFF' : '#CBD5E1' }}>
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {visibleItems.map((item) => (
              <article key={item.canonicalId} className="rounded-xl border p-3" style={{ borderColor: '#334155', background: '#080C13' }}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: timingColor[item.timing] }}>{timingLabel[item.timing]}</span>
                  <span className="text-[10px] uppercase" style={{ color: '#64748B' }}>{typeLabel[item.type]} · {(item.priority ?? 'normal').toUpperCase()}</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                <p className="mt-1 text-[11px]" style={{ color: '#94A3B8' }}>
                  {item.effectiveAt ? new Date(item.effectiveAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Needs a next-action date'}
                </p>
              </article>
            ))}
            {visibleItems.length === 0 && <p className="rounded-xl border p-4 text-sm" style={{ borderColor: '#334155', color: '#94A3B8' }}>No sample loops match this filter.</p>}
          </div>
          <p className="mt-3 text-[10px]" style={{ color: '#64748B' }}>Counts stay global when you filter the list. Sample records only; no changes are saved.</p>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border p-2.5" style={{ borderColor: color + '44', background: color + '10' }}>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
      <p className="mt-0.5 text-[10px] leading-tight" style={{ color: '#CBD5E1' }}>{label}</p>
    </div>
  );
}
