import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { filterEntries, readEntries, writeEntries, STORAGE_KEY } from './entry-utils.mjs';
import { Activity, Archive, Check, Circle, Clock3, Plus, Search, Sparkles } from 'lucide-react';
import type { Recommendation } from '@lifeos/domain';
import { NextBestActionCard } from './components/NextBestActionCard';

type EntryType = 'task' | 'question' | 'follow-up' | 'idea' | 'event';
type Entry = {
  id: string;
  title: string;
  type: EntryType;
  createdAt: string;
  completedAt: string | null;
};

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

const entryTypes: { value: EntryType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'question', label: 'Question' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'idea', label: 'Idea' },
  { value: 'event', label: 'Event' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>(() => readEntries(window.localStorage));
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EntryType>('task');
  const [query, setQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    try {
      writeEntries(window.localStorage, entries, STORAGE_KEY);
    } catch {
      // The app remains usable for this session if browser storage is unavailable.
    }
  }, [entries]);

  const openEntries = useMemo(() => entries.filter((entry) => !entry.completedAt), [entries]);
  const completedEntries = useMemo(() => entries.filter((entry) => entry.completedAt), [entries]);
  const visibleEntries = useMemo(
    () => filterEntries(entries, query, showCompleted),
    [entries, query, showCompleted],
  );

  function capture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const now = new Date().toISOString();
    setEntries((current) => [{ id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, title: cleanTitle, type, createdAt: now, completedAt: null }, ...current]);
    setTitle('');
  }

  function completeEntry(id: string) {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, completedAt: new Date().toISOString() } : entry));
  }

  function reopenEntry(id: string) {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, completedAt: null } : entry));
  }

  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <main className="min-h-screen px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))] text-slate-100 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-7 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-400"><Activity size={14} /> Personal operating system</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">LifeOS<span className="text-amber-400">.</span></h1>
            <p className="mt-1 text-sm text-slate-400">Mission Control</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
            <p className="text-xs text-slate-400">Today</p>
            <p className="text-sm font-semibold">{today}</p>
          </div>
        </header>

        <NextBestActionCard recommendation={nba} onAction={(action) => { if (action === 'Call Now') window.location.href = 'tel:'; }} />

        <section className="mb-5 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.12] via-slate-900 to-slate-950 p-5 shadow-[0_0_38px_rgba(245,158,11,0.08)] sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/15 text-amber-300"><Plus size={19} /></span>
            <div>
              <h2 className="font-bold">Universal Capture</h2>
              <p className="text-xs text-slate-400">Get it out of your head. Organize it later.</p>
            </div>
          </div>
          <form onSubmit={capture} className="space-y-3">
            <label className="sr-only" htmlFor="capture-title">What do you want to capture?</label>
            <input id="capture-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task, question, idea, or follow-up…" maxLength={240} className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15" />
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="capture-type">Entry type</label>
              <select id="capture-type" value={type} onChange={(event) => setType(event.target.value as EntryType)} className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-3 text-sm text-slate-200 outline-none focus:border-amber-400/70">
                {entryTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <button type="submit" disabled={!title.trim()} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 font-bold text-slate-950 transition hover:bg-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={17} /> Capture</button>
            </div>
          </form>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="mb-2 flex items-center gap-2 text-xs text-slate-400"><Circle size={13} className="text-amber-400" /> Open loops</p>
            <p className="text-3xl font-bold tabular-nums">{openEntries.length}</p>
            <p className="mt-1 text-xs text-slate-500">Items needing attention</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="mb-2 flex items-center gap-2 text-xs text-slate-400"><Check size={13} className="text-emerald-400" /> Completed</p>
            <p className="text-3xl font-bold tabular-nums">{completedEntries.length}</p>
            <p className="mt-1 text-xs text-slate-500">Closed loops</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
          <div className="border-b border-white/[0.08] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400"><Sparkles size={13} /> Focus</p>
                <h2 className="text-lg font-bold">{showCompleted ? 'Completed items' : 'Attention Queue'}</h2>
              </div>
              <button type="button" onClick={() => setShowCompleted((value) => !value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">{showCompleted ? 'Show open' : `Completed · ${completedEntries.length}`}</button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <label className="sr-only" htmlFor="entry-search">Search captured items</label>
              <input id="entry-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your items…" className="min-h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400/50" />
            </div>
          </div>

          {visibleEntries.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04] text-slate-500"><Archive size={21} /></span>
              <h3 className="font-semibold">{query ? 'No matches found' : showCompleted ? 'Nothing completed yet' : 'Your queue is clear'}</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-slate-400">{query ? 'Try a different search term.' : showCompleted ? 'Items you complete will be saved here.' : 'Capture an open loop above when something needs your attention.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {visibleEntries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 p-4 sm:p-5">
                  <button type="button" aria-label={entry.completedAt ? `Reopen ${entry.title}` : `Complete ${entry.title}`} onClick={() => entry.completedAt ? reopenEntry(entry.id) : completeEntry(entry.id)} className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${entry.completedAt ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-600 text-transparent hover:border-amber-400 hover:text-amber-400'}`}>{entry.completedAt ? <Check size={14} /> : <Check size={14} />}</button>
                  <div className="min-w-0 flex-1">
                    <p className={`break-words text-sm font-semibold ${entry.completedAt ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{entry.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 capitalize">{entry.type}</span>
                      <span className="flex items-center gap-1"><Clock3 size={11} /> {formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mx-auto mt-5 max-w-md text-center text-[11px] leading-relaxed text-slate-500">Saved in this browser on this device. This is a local-first MVP, not yet synced to a LifeOS graph or account.</p>
      </div>
    </main>
  );
}
