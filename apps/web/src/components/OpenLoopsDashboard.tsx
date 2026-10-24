import { useMemo, useState } from 'react';
import { filterOpenLoops, resolveOpenLoops } from '@lifeos/domain';
import type { OpenLoopSourceRecord, OpenLoopTiming } from '@lifeos/domain';

const now = new Date();
const hoursFromNow = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
const samples: OpenLoopSourceRecord[] = [
  { id: 'demo-task-1', type: 'task', title: 'Review utility transfer checklist', status: 'ACTIVE', createdAt: hoursFromNow(-96), updatedAt: hoursFromNow(-8), dueAt: hoursFromNow(-5), priority: 'high', linkedEntityIds: ['demo-move'] },
  { id: 'demo-question-1', type: 'question', title: 'Confirm the next bill due date', status: 'WAITING', createdAt: hoursFromNow(-48), updatedAt: hoursFromNow(-2), dueAt: hoursFromNow(20), priority: 'urgent', linkedEntityIds: ['demo-bill'] },
  { id: 'demo-follow-up-1', type: 'follow_up', title: 'Follow up on service transfer', status: 'ACTIVE', createdAt: hoursFromNow(-24), updatedAt: hoursFromNow(-1), nextActionAt: hoursFromNow(52), priority: 'normal', linkedEntityIds: ['demo-move'] },
  { id: 'demo-risk-1', type: 'risk', title: 'Check for any move-day gaps', status: 'BLOCKED', createdAt: hoursFromNow(-120), updatedAt: hoursFromNow(-12), priority: 'high', linkedEntityIds: ['demo-move'] },
  { id: 'demo-event-1', type: 'event_follow_up', title: 'Send meeting follow-up', status: 'ACTIVE', createdAt: hoursFromNow(-30), updatedAt: hoursFromNow(-3), dueAt: hoursFromNow(12), priority: 'normal', requiresFollowUp: true },
];
const filters: { label: string; value: OpenLoopTiming | 'all' }[] = [
  { label: 'All', value: 'all' }, { label: 'Overdue', value: 'overdue' },
  { label: 'Next 72h', value: 'next_72_hours' }, { label: 'Later', value: 'later' },
  { label: 'No date', value: 'no_due_date' },
];
const labels: Record<OpenLoopTiming, string> = { overdue: 'OVERDUE', next_72_hours: 'NEXT 72 HOURS', later: 'LATER', no_due_date: 'NO DUE DATE' };
const colors: Record<OpenLoopTiming, string> = { overdue: '#F59E0B', next_72_hours: '#60A5FA', later: '#94A3B8', no_due_date: '#C084FC' };
const types: Record<OpenLoopSourceRecord['type'], string> = { task: 'Task', question: 'Question', follow_up: 'Follow-up', risk: 'Risk', commitment: 'Commitment', event_follow_up: 'Event follow-up' };

export function OpenLoopsDashboard() {
  const [filter, setFilter] = useState<OpenLoopTiming | 'all'>('all');
  const resolved = useMemo(() => resolveOpenLoops(samples, now), []);
  const visible = useMemo(() => filterOpenLoops(resolved, { timing: filter }), [resolved, filter]);
  return <section className="mb-5 rounded-3xl border border-blue-400/25 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_28px_rgba(37,99,235,0.08)] sm:p-6">
    <div className="mb-4 flex items-start justify-between gap-3"><div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">System Load</p>
      <h2 className="mt-1 text-xl font-bold">Open Loops</h2>
      <p className="mt-1 text-xs text-slate-400">Resolver-driven counts · sample fixtures only</p>
    </div><div className="rounded-xl border border-blue-400/30 bg-blue-950/40 px-3 py-2 text-center"><p className="text-2xl font-bold tabular-nums">{resolved.totalOpen}</p><p className="text-[10px] uppercase tracking-wider text-blue-300">Open</p></div></div>
    <div className="mb-4 grid grid-cols-3 gap-2">
      <Metric label="Overdue" value={resolved.overdueCount} color="#F59E0B" />
      <Metric label="Next 72h" value={resolved.dueWithin72HoursCount} color="#60A5FA" />
      <Metric label="No due date" value={resolved.noDueDateCount} color="#C084FC" />
    </div>
    <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">{filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === item.value ? 'border-blue-400 bg-blue-700 text-white' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>{item.label}</button>)}</div>
    <div className="space-y-2">{visible.map((item) => <article key={item.canonicalId} className="rounded-xl border border-slate-700 bg-black/25 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2"><span className="text-[10px] font-bold tracking-wider" style={{ color: colors[item.timing] }}>{labels[item.timing]}</span><span className="text-[10px] uppercase text-slate-500">{types[item.type]} · {(item.priority ?? 'normal').toUpperCase()}</span></div>
      <h3 className="text-sm font-semibold leading-snug">{item.title}</h3><p className="mt-1 text-[11px] text-slate-400">{item.effectiveAt ? new Date(item.effectiveAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Needs a next-action date'}</p>
    </article>)}{visible.length === 0 && <p className="rounded-xl border border-slate-700 p-4 text-sm text-slate-400">No sample loops match this filter.</p>}</div>
    <p className="mt-3 text-[10px] text-slate-500">Sample records only. Not connected to your LifeOS graph or financial accounts.</p>
  </section>;
}
function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="rounded-xl border p-2.5" style={{ borderColor: color + '44', background: color + '10' }}><p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p><p className="mt-0.5 text-[10px] leading-tight text-slate-300">{label}</p></div>;
}