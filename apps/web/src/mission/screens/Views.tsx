import { useState, type ReactNode } from 'react';
import { agenda, calendarUrl, groupAgenda } from '../lib/agenda';
import { daysUntil, money } from '../lib/dates';
import { health, type HealthGo } from '../lib/health';
import { useStore } from '../store';
import type { LifeData, Ref } from '../types';
import { btn, card, field, row } from '../ui';

export type ViewName = 'health' | 'agenda' | 'context' | 'memory';
const Back = ({ onBack }: { onBack: () => void }) => <button onClick={onBack} className={`${btn} mb-3`}>‹ Mission briefing</button>;
const Details = ({ title, count, open, children }: { title: string; count: number; open?: boolean; children: ReactNode }) => (
  <details open={open} className={`${card} mb-3`}><summary className="flex min-h-10 cursor-pointer items-center justify-between font-semibold">{title}<span className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-2)]">{count}</span></summary>{children}</details>
);

export function SystemCheck({ data, inboxCount, go, onBack }: { data: LifeData; inboxCount: number; go: (g: HealthGo) => void; onBack: () => void }) {
  const h = health(data, inboxCount);
  const color = h.score >= 80 ? 'var(--opp)' : h.score >= 50 ? 'var(--risk)' : 'var(--critical)';
  return (
    <section><Back onBack={onBack} />
      <div className={`${card} mb-3 flex items-center gap-4`}><span className="text-5xl font-bold" style={{ color }}>{h.score}</span><div><h2 className="text-lg font-semibold">System check</h2><p className="text-xs text-[var(--text-2)]">From overdue bills, stale loops, decisions, people, and inbox.</p></div></div>
      <div className={card}>{h.rows.map((r) => (
        <button key={r.label} onClick={() => go(r.go)} className={row}><span>{r.label}</span><b style={{ color: r.count ? 'var(--risk)' : 'var(--opp)' }}>{r.count ? `${r.count} need attention` : 'On track'} ›</b></button>
      ))}</div>
    </section>
  );
}

export function Agenda({ data, open, onBack }: { data: LifeData; open: (r: Ref) => void; onBack: () => void }) {
  const groups = groupAgenda(agenda(data));
  const first = groups.findIndex((g) => g.items.length);
  return (
    <section><Back onBack={onBack} />
      {groups.map((g, i) => (
        <Details key={g.label} title={g.label} count={g.items.length} open={i === first}>
          {g.items.length ? g.items.map((a) => (
            <div key={a.date + a.title} className={row}>
              <button onClick={() => open(a.ref)} className="min-h-11 flex-1 text-left"><b>{a.title}</b><span className="block text-xs text-[var(--text-2)]">{a.date} · {a.sub}</span></button>
              <a href={calendarUrl(a)} target="_blank" rel="noopener noreferrer" className={`${btn} grid min-h-10 place-items-center`}>＋ Cal</a>
            </div>
          )) : <p className="text-sm text-[var(--text-2)]">Nothing here.</p>}
        </Details>
      ))}
    </section>
  );
}

export function People({ data, open, onAdd, onBack }: { data: LifeData; open: (id: string) => void; onAdd: (name: string) => void; onBack: () => void }) {
  const inbox = useStore((s) => s.inbox);
  const [name, setName] = useState('');
  const ctx: Record<string, number> = {};
  for (const t of inbox) for (const c of (t.match(/(^|\s)\*([\w.-]+)/g) ?? []).map((m) => m.trim().slice(1))) ctx[c] = (ctx[c] ?? 0) + 1;
  return (
    <section><Back onBack={onBack} />
      {data.people.length ? data.people.map((p) => {
        const g = p.lastContact ? -daysUntil(p.lastContact) : null;
        const late = g !== null && p.frequencyDays !== undefined && g >= p.frequencyDays;
        return <button key={p.id} onClick={() => open(p.id)} className={`${card} mb-2 flex w-full items-center justify-between text-left`}><span>{p.name}<span className="block text-xs text-[var(--text-2)]">{p.relationship || '—'}</span></span><span style={{ color: late ? 'var(--risk)' : 'var(--text-2)' }}>{g === null ? 'No contact' : `${g}d ago`} ›</span></button>;
      }) : <p className="py-6 text-center text-[var(--text-2)]">No people yet.</p>}
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onAdd(name.trim()); setName(''); } }} className="mt-3 flex gap-2"><input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a person" aria-label="Add a person" /><button className={btn}>Add</button></form>
      <h3 className="mb-2 mt-4 text-xs font-semibold text-[var(--text-2)]">Contexts</h3>
      <div className="flex flex-wrap gap-1.5">{Object.keys(ctx).length ? Object.entries(ctx).map(([c, n]) => <span key={c} className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--text-2)]">*{c} {n}</span>) : <span className="text-xs text-[var(--text-2)]">Add *home or *work to a capture.</span>}</div>
    </section>
  );
}

export function Memory({ data, archive, open, onBack }: { data: LifeData; archive: string[]; open: (billId: string) => void; onBack: () => void }) {
  const restoreAt = useStore((s) => s.restoreAt);
  const pays = data.bills.flatMap((b) => (b.paymentHistory ?? []).map((p) => ({ d: p.date.slice(0, 10), t: b.title, a: p.amount, id: b.id }))).sort((a, b) => b.d.localeCompare(a.d));
  const closed = data.loops.filter((l) => l.status !== 'active' && l.status !== 'waiting').length;
  const decided = data.decisions.filter((x) => x.reviewed || x.actualOutcome).length;
  return (
    <section><Back onBack={onBack} />
      <Details title="Payments" count={pays.length} open>
        {pays.length ? pays.slice(0, 8).map((p, i) => <button key={i} onClick={() => open(p.id)} className={row}><span>{p.t}<span className="block text-xs text-[var(--text-2)]">{p.d}</span></span><b>{money(p.a)}</b></button>) : <p className="text-sm text-[var(--text-2)]">No payments recorded yet.</p>}
      </Details>
      <Details title="Archived captures" count={archive.length}>
        {archive.length ? archive.map((t, i) => <div key={i} className={row}><span>{t}</span><button onClick={() => restoreAt(i)} className={`${btn} min-h-10`}>Restore</button></div>) : <p className="text-sm text-[var(--text-2)]">Nothing archived.</p>}
      </Details>
      <div className={card}><h3 className="font-semibold">Closed out</h3><p className="text-xs text-[var(--text-2)]">{closed} loops closed · {decided} decisions reviewed</p></div>
    </section>
  );
}
