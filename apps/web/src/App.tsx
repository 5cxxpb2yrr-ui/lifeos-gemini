import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { filterEntries, loadEntries, writeEntries, STORAGE_KEY } from './entry-utils.mjs';
import { readLifeOSBackupFile } from './backup-utils.mjs';
import { Activity, Archive, Check, Circle, Clock3, Plus, Search, Sparkles } from 'lucide-react';
import type { Recommendation } from '@lifeos/domain';
import { NextBestActionCard } from './components/NextBestActionCard';
import { OpenLoopsDashboard } from './components/OpenLoopsDashboard';

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
  const [storageState, setStorageState] = useState(() => loadEntries(window.localStorage, STORAGE_KEY));
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EntryType>('task');
  const [query, setQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [backupSummary, setBackupSummary] = useState<Awaited<ReturnType<typeof readLifeOSBackupFile>> | null>(null);
  const [backupError, setBackupError] = useState('');
  const [backupName, setBackupName] = useState('');
  const [writeError, setWriteError] = useState(false);
  const [capturedMessage, setCapturedMessage] = useState('');
  const [showRecoveryNotice, setShowRecoveryNotice] = useState(true);

  const { entries, status: storageStatus, backupKey: recoveryKey } = storageState;

  useEffect(() => {
    const wrote = writeEntries(window.localStorage, entries, STORAGE_KEY);
    if (!wrote) {
      setWriteError(true);
      return;
    }
    setWriteError(false);
  }, [entries]);

  useEffect(() => {
    if (!capturedMessage) return;
    const timer = window.setTimeout(() => setCapturedMessage(''), 1800);
    return () => window.clearTimeout(timer);
  }, [capturedMessage]);

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
    setStorageState((current) => ({
      ...current,
      entries: [{ id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, title: cleanTitle, type, createdAt: now, completedAt: null }, ...current.entries],
    }));
    setTitle('');
    setQuery('');
    setShowCompleted(false);
    setCapturedMessage('Captured');
  }

  function completeEntry(id: string) {
    setStorageState((current) => ({ ...current, entries: current.entries.map((entry) => entry.id === id ? { ...entry, completedAt: new Date().toISOString() } : entry) }));
  }

  function reopenEntry(id: string) {
    setStorageState((current) => ({ ...current, entries: current.entries.map((entry) => entry.id === id ? { ...entry, completedAt: null } : entry) }));
  }

  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const showRecoveryBanner = ['corrupt', 'partial', 'unavailable'].includes(storageStatus) && showRecoveryNotice;

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

        {showRecoveryBanner && (
          <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            <p>
              A recovery copy was kept{recoveryKey ? ` at ${recoveryKey}` : ''}. Some saved records may have been repaired or skipped.
            </p>
            <button type="button" onClick={() => setShowRecoveryNotice(false)} aria-label="Dismiss recovery notice" className="rounded-full px-2 py-1 text-base text-amber-100 transition hover:bg-white/5">×</button>
          </div>
        )}

        <section className="mb-5 rounded-3xl border border-amber-400/25 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-bold">Load LifeOS Backup</h2><p className="mt-1 text-xs text-slate-400">Read a JSON file on this device. Nothing is uploaded or imported into the graph.</p></div>
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 text-sm font-semibold text-amber-200 hover:bg-amber-400/15">
              <input type="file" accept="application/json,.json" className="hidden" onChange={(event) => void loadBackup(event.target.files?.[0])} />
              Load backup
            </label>
          </div>
          {backupError && <p role="alert" className="mt-3 text-sm text-rose-300">{backupError}</p>}
          {backupSummary && <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs text-emerald-300">Read locally: {backupName}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <BackupMetric label="Records" value={backupSummary.totalRecords} />
              <BackupMetric label="Open loops" value={backupSummary.openLoops.length} />
              <BackupMetric label="Completed" value={backupSummary.completedLoops.length} />
              <BackupMetric label="Events" value={backupSummary.events.length} />
            </div>
            {backupSummary.financialSections.length > 0 && <p className="mt-3 text-xs text-slate-400">Account, asset, and financial sections detected ({backupSummary.financialSections.join(', ')}).</p>}
            <details className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-300">All record sections ({Object.keys(backupSummary.sectionCounts).length})</summary>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(backupSummary.sectionCounts).sort(([a], [b]) => a.localeCompare(b)).map(([section, count]) => <li key={section} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5 text-xs text-slate-300"><span>{section}</span><span className="font-semibold text-amber-300">{count}</span></li>)}
              </ul>
            </details>
            {backupSummary.openLoops.length > 0 && <div className="mt-3 space-y-2">{backupSummary.openLoops.slice(0, 5).map((loop) => <div key={loop.id} className="rounded-xl border border-white/[0.08] bg-black/20 p-3"><p className="text-sm font-semibold text-slate-200">{loop.title}</p><p className="mt-1 text-[11px] text-slate-400">{loop.status} · {loop.type}</p></div>)}</div>}
            <p className="mt-3 text-[11px] text-slate-400">Preview only. Your existing local capture items were not overwritten.</p>
          </div>}
        </section>

        <NextBestActionCard recommendation={nba} sample />
        <OpenLoopsDashboard />

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
            <input id="capture-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task, question, idea, or follow-up…" maxLength={240} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="capture-type">Entry type</label>
              <select id="capture-type" value={type} onChange={(event) => setType(event.target.value as EntryType)} className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50">
                {entryTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <button type="submit" disabled={!title.trim()} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">Capture</button>
            </div>
          </form>
          {capturedMessage && <div aria-live="polite" aria-atomic="true" className="mt-3 text-sm font-medium text-emerald-300">{capturedMessage}</div>}
          {writeError && <p role="alert" className="mt-3 text-sm text-rose-300">Unable to save this item in browser storage.</p>}
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="mb-2 flex items-center gap-2 text-xs text-slate-400"><Circle size={13} className="text-amber-400" /> Your open loops</p>
            <p className="text-3xl font-bold tabular-nums">{openEntries.length}</p>
            <p className="mt-1 text-xs text-slate-400">Items needing attention</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="mb-2 flex items-center gap-2 text-xs text-slate-400"><Check size={13} className="text-emerald-400" /> Completed</p>
            <p className="text-3xl font-bold tabular-nums">{completedEntries.length}</p>
            <p className="mt-1 text-xs text-slate-400">Closed loops</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
          <div className="border-b border-white/[0.08] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400"><Sparkles size={13} /> Focus</p>
                <h2 className="text-lg font-bold">{showCompleted ? 'Completed items' : 'Attention Queue'}</h2>
              </div>
              <button type="button" onClick={() => setShowCompleted((value) => !value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.05]">{showCompleted ? 'Open only' : 'Completed'}</button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <label className="sr-only" htmlFor="entry-search">Search captured items</label>
              <input id="entry-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your items…" className="min-h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
            </div>
          </div>

          {visibleEntries.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04] text-slate-400"><Archive size={21} /></span>
              <h3 className="font-semibold">{query ? 'No matches found' : showCompleted ? 'Nothing completed yet' : 'Your queue is clear'}</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-slate-400">{query ? 'Try a different search term.' : showCompleted ? 'Items you complete will be saved here.' : 'Capture an open loop to keep it moving.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {visibleEntries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 p-4 sm:p-5">
                  <button type="button" aria-label={entry.completedAt ? `Reopen ${entry.title}` : `Complete ${entry.title}`} aria-pressed={Boolean(entry.completedAt)} onClick={() => entry.completedAt ? reopenEntry(entry.id) : completeEntry(entry.id)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-200 transition hover:border-amber-400/60 hover:text-amber-200">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-current bg-slate-950/80">
                      <span className={`block h-3 w-3 rounded-full ${entry.completedAt ? 'bg-emerald-400' : 'bg-transparent'}`} />
                    </span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`break-words text-sm font-semibold ${entry.completedAt ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{entry.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                      <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 capitalize">{entry.type}</span>
                      <span className="flex items-center gap-1"><Clock3 size={11} /> {formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mx-auto mt-5 max-w-md text-center text-[11px] leading-relaxed text-slate-400">Saved in this browser on this device. This is a local-first MVP, not yet synced to a LifeOS graph or your financial accounts.</p>
      </div>
    </main>
  );

  async function loadBackup(file?: File) {
    if (!file) return;
    setBackupError('');
    try {
      const summary = await readLifeOSBackupFile(file);
      setBackupSummary(summary);
      setBackupName(file.name);
    } catch (error) {
      setBackupSummary(null);
      setBackupName('');
      setBackupError(error instanceof Error ? error.message : 'Could not read this backup.');
    }
  }
}

function BackupMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-2xl font-bold tabular-nums text-amber-300">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>;
}
