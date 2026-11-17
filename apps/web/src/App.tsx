import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, Bell, CalendarDays, Check, ChevronRight,
  CircleDot, Clock3, Home, Plus, Search, Sparkles, UserRound, Car, X,
  AlertTriangle, Link2, Inbox, Hourglass, CheckCircle2, SlidersHorizontal, Download, Upload,
} from 'lucide-react';
import { resolveLifeLoad, type LifeObject, type LifeObjectType, type LoopPriority, type LoopStatus } from '@lifeos/domain';

type Screen = 'home' | 'loops' | 'timeline' | 'search' | { detailId: string };
type CaptureKind = 'auto' | LifeObjectType;
const STORAGE_KEY = 'lifeos.v3.workspace.v1';

function readWorkspace(): LifeObject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const demoIds = new Set(['asset-subaru','asset-home','person-family','person-contractor','event-oil','event-dinner','event-service-window','loop-quote','loop-registration','loop-bloodwork']);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string' && !demoIds.has(item.id) && ['event', 'loop', 'person', 'asset'].includes(item.type)).map((item) => ({ ...item, areas: item.areas ?? item.streams ?? [], relatedIds: (item.relatedIds ?? []).filter((id: string) => !demoIds.has(id)) })) : [];
  } catch { return []; }
}
const fmt = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', ...(new Date(value).getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}) }).format(new Date(value)) : 'No date';
const fmtTime = (value?: string) => value ? new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : 'Date not set';
const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const isOpen = (item: LifeObject) => item.type === 'loop' && item.status !== 'complete';
const kindLabel: Record<LifeObjectType, string> = { event: 'Event', loop: 'Open Loop', person: 'Person', asset: 'Asset' };
const priorityColor: Record<LoopPriority, string> = { low: '#64748b', normal: '#94a3b8', high: '#f59e0b', urgent: '#fb7185' };

export default function App() {
  const [objects, setObjects] = useState<LifeObject[]>(readWorkspace);
  const [screenStack, setScreenStack] = useState<Screen[]>(['home']);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [captureKind, setCaptureKind] = useState<CaptureKind>('auto');
  const [relatedId, setRelatedId] = useState('');
  const [captureDueDate, setCaptureDueDate] = useState('');
  const [capturePriority, setCapturePriority] = useState<LoopPriority>('normal');
  const [captureWaitingOn, setCaptureWaitingOn] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loopFilter, setLoopFilter] = useState<'all' | LoopStatus>('all');
  const [showLoadDetails, setShowLoadDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [linkTargetId, setLinkTargetId] = useState('');
  const [areaDraft, setAreaDraft] = useState('');
  const backupInputRef = useRef<HTMLInputElement>(null);
  const current = screenStack[screenStack.length - 1];
  const activeDetail = typeof current === 'object' ? objects.find((item) => item.id === current.detailId) : undefined;
  const load = useMemo(() => resolveLifeLoad(objects), [objects]);
  const loops = useMemo(() => objects.filter(isOpen), [objects]);
  const events = useMemo(() => objects.filter((item) => item.type === 'event').sort((a,b) => Date.parse(b.occurredAt ?? b.createdAt) - Date.parse(a.occurredAt ?? a.createdAt)), [objects]);
  const waiting = loops.filter((item) => item.status === 'waiting' || item.waitingOn);
  const attention = [...loops].sort((a,b) => (load.drivers.find(x=>x.id===b.id)?.points ?? 0) - (load.drivers.find(x=>x.id===a.id)?.points ?? 0)).slice(0,3);
  const dueSoon = loops.filter((item) => item.dueAt && Date.parse(item.dueAt) <= Date.now() + 7*86400000).sort((a,b)=>Date.parse(a.dueAt!) - Date.parse(b.dueAt!));
  const upcomingEvents = objects.filter((item) => item.type === 'event' && item.occurredAt && Date.parse(item.occurredAt) >= Date.now()).sort((a,b)=>Date.parse(a.occurredAt!) - Date.parse(b.occurredAt!));
  const matches = objects.filter((item) => {
    const q = searchText.trim().toLocaleLowerCase();
    return q && [item.title, item.notes ?? '', item.assetType ?? '', item.personType ?? '', ...(item.areas ?? [])].join(' ').toLocaleLowerCase().includes(q);
  });

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(objects)); } catch { /* session remains usable */ } }, [objects]);
  useEffect(() => { setEditTitle(activeDetail?.title ?? ''); setEditNotes(activeDetail?.notes ?? ''); setEditing(false); setLinkTargetId(''); setAreaDraft(''); }, [activeDetail?.id]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setScreenStack(['search']); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') { event.preventDefault(); setCaptureOpen(true); }
      if (event.key === 'Escape') { setCaptureOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function push(screen: Screen) { setScreenStack((stack) => [...stack, screen]); }
  function back() { setScreenStack((stack) => stack.length > 1 ? stack.slice(0,-1) : ['home']); }
  function go(screen: Screen) { setScreenStack([screen]); }
  function openCapture() { setCaptureText(''); setCaptureKind('auto'); setRelatedId(''); setCaptureDueDate(''); setCapturePriority('normal'); setCaptureWaitingOn(''); setCaptureOpen(true); }
  function exportWorkspace() {
    const backup = { app: 'LifeOS', schemaVersion: 1, exportedAt: new Date().toISOString(), objects };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lifeos-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }
  async function importWorkspace(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const imported = Array.isArray(parsed) ? parsed : parsed.objects;
      if (!Array.isArray(imported) || imported.some((item) => !item || typeof item.id !== 'string' || typeof item.title !== 'string' || !['event','loop','person','asset'].includes(item.type))) throw new Error('This is not a valid LifeOS backup.');
      if (!window.confirm('Replace the records in this browser with the records from this backup?')) return;
      setObjects(imported.map((item) => ({ ...item, areas: item.areas ?? item.streams ?? [], relatedIds: Array.isArray(item.relatedIds) ? item.relatedIds : [] })));
      setScreenStack(['home']);
      setCaptureOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not restore this backup.');
    } finally {
      event.target.value = '';
    }
  }
  function addObjects(items: LifeObject[]) { setObjects((all) => [...items, ...all.map((existing) => { const links = items.filter((item) => item.relatedIds.includes(existing.id)).map((item) => item.id); return links.length ? { ...existing, relatedIds: [...new Set([...existing.relatedIds, ...links])] } : existing; })]); }
  function addObject(item: LifeObject) { addObjects([item]); }
  function capture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = captureText.trim();
    if (!text) return;
    const timestamp = new Date().toISOString();
    const common = { id: id(), title: text, createdAt: timestamp, updatedAt: timestamp, relatedIds: relatedId ? [relatedId] : [], areas: [] as string[] };
    if (captureKind === 'person' || captureKind === 'asset') {
      addObject({ ...common, type: captureKind, ...(captureKind === 'person' ? { personType: 'Person' } : { assetType: 'Asset' }) });
    } else if (captureKind === 'event') {
      addObject({ ...common, type: 'event', occurredAt: timestamp });
    } else if (captureKind === 'loop') {
      addObject({ ...common, type: 'loop', status: 'open', priority: capturePriority, dueAt: captureDueDate ? new Date(`${captureDueDate}T12:00:00`).toISOString() : null, waitingOn: captureWaitingOn || null });
    } else if (captureKind === 'auto') {
      const sentences = text.split(/(?<=[.!?])\s+/);
      const eventPart = sentences.find((part) => /\b(had|changed|paid|finished|completed|met|went|bought|visited|worked out|replaced|installed|attended)\b/i.test(part));
      const loopPart = sentences.find((part) => /\b(need(?: to)?|needs to|should|must|remind me|follow up|schedule|renew|call|send|check|book|pay|replace|waiting on)\b/i.test(part));
      if (eventPart || loopPart) {
        const eventId = eventPart ? id() : undefined;
        const loopId = loopPart ? id() : undefined;
        const created: LifeObject[] = [];
        if (eventPart) created.push({ ...common, id: eventId!, title: eventPart.replace(/[.!?]+$/, ''), type: 'event', occurredAt: timestamp, relatedIds: [...common.relatedIds, ...(loopId ? [loopId] : [])] });
        if (loopPart) created.push({ ...common, id: loopId!, title: loopPart.replace(/[.!?]+$/, ''), type: 'loop', status: /waiting on/i.test(loopPart) ? 'waiting' : 'open', priority: capturePriority, dueAt: captureDueDate ? new Date(`${captureDueDate}T12:00:00`).toISOString() : null, waitingOn: captureWaitingOn || (/(waiting on|waiting for)/i.test(loopPart) ? 'Someone else' : null), relatedIds: [...common.relatedIds, ...(eventId ? [eventId] : [])] });
        addObjects(created);
      } else addObject({ ...common, type: 'event', occurredAt: timestamp });
    }
    setCaptureOpen(false);
    setCaptureText('');
  }
  function completeLoop(item: LifeObject) {
    const timestamp = new Date().toISOString();
    const completion: LifeObject = { id: id(), type: 'event', title: `Closed loop: ${item.title}`, occurredAt: timestamp, createdAt: timestamp, updatedAt: timestamp, relatedIds: [item.id, ...item.relatedIds], areas: item.areas ?? [] };
    setObjects((all) => all.map((x) => x.id === item.id ? { ...x, status: 'complete' as const, updatedAt: timestamp, relatedIds: [...new Set([...x.relatedIds, completion.id])] } : x).concat(completion));
  }
  function setLoopStatus(item: LifeObject, status: LoopStatus) {
    setObjects((all) => all.map((x) => x.id === item.id ? { ...x, status: status as LoopStatus, updatedAt: new Date().toISOString() } : x));
  }
  function updateLoop(item: LifeObject, patch: Partial<LifeObject>) {
    setObjects((all) => all.map((x) => x.id === item.id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x));
  }
  function saveDetails() {
    if (!activeDetail || !editTitle.trim()) return;
    updateLoop(activeDetail, { title: editTitle.trim(), notes: editNotes.trim() });
    setEditing(false);
  }
  function linkContext() {
    if (!activeDetail || !linkTargetId) return;
    setObjects((all) => all.map((x) => x.id === activeDetail.id || x.id === linkTargetId ? { ...x, relatedIds: [...new Set([...x.relatedIds, x.id === activeDetail.id ? linkTargetId : activeDetail.id])] } : x));
    setLinkTargetId('');
  }
  function addArea(value = areaDraft) {
    if (!activeDetail || !value.trim()) return;
    const area = value.trim().replace(/\s+/g, ' ');
    updateLoop(activeDetail, { areas: [...new Set([...(activeDetail.areas ?? []), area])] });
    setAreaDraft('');
  }
  function removeArea(area: string) {
    if (activeDetail) updateLoop(activeDetail, { areas: (activeDetail.areas ?? []).filter((item) => item !== area) });
  }
  function related(item: LifeObject) { return objects.filter((candidate) => candidate.id !== item.id && item.relatedIds.includes(candidate.id)); }

  const loadTone = load.score <= 25 ? '#55d6a0' : load.score <= 75 ? '#60a5fa' : load.score <= 125 ? '#fbbf24' : load.score <= 175 ? '#fb923c' : '#fb7185';
  const pageTitle = current === 'home' ? 'Mission Control' : current === 'loops' ? 'Open Loops' : current === 'timeline' ? 'Timeline' : current === 'search' ? 'Search' : activeDetail?.title ?? 'Record';

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100">
      <div className="mx-auto min-h-screen max-w-6xl pb-28 md:flex md:pb-8">
        <aside className="hidden w-60 shrink-0 border-r border-white/[0.07] px-5 py-8 md:flex md:flex-col">
          <button onClick={() => go('home')} className="mb-10 text-left"><span className="text-xs font-bold uppercase tracking-[.22em] text-blue-300">Personal OS</span><span className="mt-1 block text-2xl font-black">LifeOS<span className="text-amber-400">.</span></span></button>
          <nav className="space-y-2">
            {([['home','Mission Control',Home],['loops','Open Loops',CircleDot],['timeline','Timeline',CalendarDays],['search','Search',Search]] as const).map(([key,label,Icon]) => <button key={key} onClick={() => go(key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${current === key ? 'bg-blue-500/15 text-blue-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={17}/>{label}</button>)}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-[10px] uppercase tracking-widest text-slate-500">Life Load estimate</p><p className="mt-1 text-3xl font-bold tabular-nums" style={{color:loadTone}}>{objects.length ? load.score : "—"}</p><p className="text-xs text-slate-400">{objects.length ? load.band : "No records yet"}</p></div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#080d16]/90 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl sm:px-6 md:px-9 md:pt-7">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {screenStack.length > 1 && <button onClick={back} aria-label="Go back" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300"><ArrowLeft size={18}/></button>}
                <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-300 md:hidden">LifeOS</p><h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{pageTitle}</h1></div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <input ref={backupInputRef} type="file" accept="application/json,.json" onChange={importWorkspace} className="hidden"/><button onClick={()=>backupInputRef.current?.click()} aria-label="Restore backup" title="Restore a LifeOS backup" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"><Upload size={17}/></button><button onClick={exportWorkspace} aria-label="Download backup" title="Download a backup of this browser workspace" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"><Download size={17}/></button><button onClick={() => go('search')} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"><Search size={18}/></button>
                <button onClick={openCapture} aria-label="Capture" className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-[0_0_22px_rgba(251,191,36,.2)]"><Plus size={21}/></button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 pb-8 pt-5 sm:px-6 md:px-9 md:pt-8">
            {current === 'home' && <section className="space-y-5">
              {objects.length === 0 && <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-950/50 to-slate-950 p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">Your life, in one place</p><h2 className="mt-3 max-w-xl text-2xl font-bold sm:text-3xl">Start with what’s on your mind.</h2><p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">Capture a commitment, record something that happened, or add a person or asset. LifeOS will connect the pieces as you go.</p><button onClick={openCapture} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950"><Plus size={17}/> Make your first capture</button></div>}
              <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
                <button onClick={() => setShowLoadDetails((v)=>!v)} className="rounded-3xl border p-5 text-left transition hover:border-white/20 sm:p-6" style={{borderColor:loadTone+'55',background:'linear-gradient(135deg,#111d2d,#0b1320)'}}>
                  <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Life Load · early estimate</p><p className="mt-2 text-5xl font-black tabular-nums" style={{color:loadTone}}>{objects.length ? load.score : "—"}<span className="ml-2 text-sm font-semibold">{objects.length ? load.band : "No data yet"}</span></p><p className="mt-2 text-xs text-slate-400">{objects.length ? `${load.openCount} unresolved commitments · tap to inspect drivers` : "Capture a few records to establish your operating picture."}</p></div><div className="grid h-14 w-14 place-items-center rounded-2xl" style={{background:loadTone+'18',color:loadTone}}><Activity size={27}/></div></div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,load.score/200*100)}%`,background:loadTone}}/></div>
                  <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-slate-500"><span>Calm 0</span><span>Stable 26</span><span>Busy 76</span><span>Stressed 126</span><span>Critical 176+</span></div>
                </button>
                <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-950/60 to-slate-950 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-blue-300"><Sparkles size={14}/> Focus</div>
                  <p className="mt-2 text-lg font-bold">Highest leverage next</p>
                  {attention.length ? <div className="mt-3 space-y-2">{attention.map((item,i)=><button key={item.id} onClick={()=>push({detailId:item.id})} className="flex w-full items-center gap-3 rounded-xl border border-white/[.07] bg-black/20 p-3 text-left"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-400/15 text-xs font-bold text-blue-200">{i+1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</span><ChevronRight size={15} className="text-slate-500"/></button>)}</div> : <p className="mt-3 text-sm text-slate-400">Nothing competing for attention. Capture what matters as it happens.</p>}
                </div>
              </div>

              {showLoadDetails && <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">What is driving Life Load?</h2><button onClick={()=>setShowLoadDetails(false)} aria-label="Close" className="text-slate-500"><X size={17}/></button></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Open loops',load.openCount*5],['Age',load.agePoints],['Priority',load.priorityPoints],['Risk',load.riskPoints],['Waiting',load.waitingPoints]].map(([label,value])=><div key={label} className="rounded-xl bg-black/20 p-3"><p className="text-xl font-bold tabular-nums">{value}</p><p className="text-xs text-slate-500">{label} points</p></div>)}</div><div className="mt-3 space-y-2">{load.drivers.map((d)=><button key={d.id} onClick={()=>push({detailId:d.id})} className="flex w-full justify-between gap-3 text-left text-sm"><span className="truncate">{d.title}<span className="ml-2 text-xs text-slate-500">{d.reasons.join(' · ')}</span></span><b className="tabular-nums">{d.points}</b></button>)}</div></div>}

              <div className="grid gap-4 md:grid-cols-2">
                <Panel title="Open Loops Due" icon={<Clock3 size={16}/>} action="View all" onAction={()=>go('loops')}>
                  {dueSoon.length ? dueSoon.slice(0,4).map(item=><ObjectRow key={item.id} item={item} onClick={()=>push({detailId:item.id})} meta={fmt(item.dueAt)}/>) : <Empty text="No upcoming commitments due in the next seven days."/>}
                </Panel>
                <Panel title="Waiting on others" icon={<Hourglass size={16}/>} action="View all" onAction={()=>go('loops')}>
                  {waiting.length ? waiting.slice(0,4).map(item=><ObjectRow key={item.id} item={item} onClick={()=>push({detailId:item.id})} meta={item.waitingOn ? `Waiting on ${item.waitingOn}` : 'Waiting'}/>) : <Empty text="Nothing is currently waiting on someone else."/>}
                </Panel>
                <Panel title="Relationship attention" icon={<UserRound size={16}/>} action="Find people" onAction={()=>go('search')}>
                  {objects.filter(x=>x.type==='person').slice(0,3).map(item=><ObjectRow key={item.id} item={item} onClick={()=>push({detailId:item.id})} meta={item.personType ?? 'Person'}/>)}
                  {!objects.some(x=>x.type==='person')&&<Empty text="People you connect to events and commitments will appear here."/>}
                </Panel>
                <Panel title="Asset attention" icon={<Car size={16}/>} action="Find assets" onAction={()=>go('search')}>
                  {objects.filter(x=>x.type==='asset').slice(0,3).map(item=><ObjectRow key={item.id} item={item} onClick={()=>push({detailId:item.id})} meta={item.assetType ?? 'Asset'}/>)}
                </Panel>
              </div>
              <Panel title="Recent wins" icon={<CheckCircle2 size={16}/>} action="Timeline" onAction={()=>go('timeline')}>
                {events.filter(x=>x.title.startsWith('Closed loop:')).slice(0,3).map(item=><ObjectRow key={item.id} item={item} onClick={()=>push({detailId:item.id})} meta={fmt(item.occurredAt)}/>)}
                {!events.some(x=>x.title.startsWith('Closed loop:'))&&<Empty text="Completed commitments become part of your timeline. Your history stays intact."/>}
              </Panel>
              <div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-4"><p className="text-xs text-slate-400">Your operating picture updates as you capture events and close loops. No separate modules to maintain.</p></div>
            </section>}

            {current === 'loops' && <section>
              <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-sm text-slate-400">Unresolved commitments</p><p className="mt-1 text-3xl font-black tabular-nums">{loops.length}<span className="ml-2 text-sm font-medium text-slate-500">open</span></p></div><button onClick={openCapture} className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950"><Plus size={16}/> Add loop</button></div>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{(['all','open','active','waiting','blocked'] as const).map(filter=><button key={filter} onClick={()=>setLoopFilter(filter)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold capitalize ${loopFilter===filter?'border-blue-400 bg-blue-500/20 text-blue-100':'border-white/10 text-slate-400'}`}>{filter==='all'?'All loops':filter}</button>)}</div>
              <div className="space-y-3">{loops.filter(item=>loopFilter==='all'||item.status===loopFilter).sort((a,b)=>({urgent:4,high:3,normal:2,low:1}[b.priority??'normal']-({urgent:4,high:3,normal:2,low:1}[a.priority??'normal']))).map(item=><LoopCard key={item.id} item={item} onOpen={()=>push({detailId:item.id})} onComplete={()=>completeLoop(item)} onStatus={(status)=>setLoopStatus(item,status)}/>)}{loops.filter(item=>loopFilter==='all'||item.status===loopFilter).length===0&&<Empty text="Nothing in this view. You're clear."/>}</div>
            </section>}

            {current === 'timeline' && <section><div className="mb-5"><p className="text-sm text-slate-400">A connected record of what happened.</p><p className="mt-1 text-xs text-slate-500">Events and completed commitments · newest first</p></div><div className="relative ml-3 border-l border-white/10 pl-6">{[...events].sort((a,b)=>Date.parse(b.occurredAt??b.createdAt)-Date.parse(a.occurredAt??a.createdAt)).map(item=><div key={item.id} className="relative mb-4"><span className="absolute -left-[31px] top-4 h-2.5 w-2.5 rounded-full border-2 border-blue-300 bg-[#080d16]"/><button onClick={()=>push({detailId:item.id})} className="w-full rounded-2xl border border-white/[.08] bg-white/[.025] p-4 text-left hover:border-blue-400/30"><p className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">{fmtTime(item.occurredAt??item.createdAt)}</p><p className="mt-1 font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{(item.areas??[]).join(' · ') || 'Life event'} · {related(item).map(x=>x.title).join(', ') || 'No linked context'}</p></button></div>)}{events.length===0&&<Empty text="Your timeline will grow as meaningful events happen."/>}</div></section>}

            {current === 'search' && <section><div className="relative mb-5"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/><input autoFocus value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search events, loops, people, assets…" className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/[.04] pl-12 pr-4 text-base outline-none focus:border-blue-400/60"/></div>{searchText.trim()?<><p className="mb-3 text-xs text-slate-500">{matches.length} result{matches.length===1?'':'s'} across your LifeOS</p><div className="space-y-2">{matches.map(item=><ObjectRow key={item.id} item={item} onClick={()=>push({detailId:item.id})} meta={kindLabel[item.type]}/>)}</div>{matches.length===0&&<Empty text="No matches. Try another name, event, asset, or phrase."/>}</>:<div className="rounded-2xl border border-white/[.07] p-5"><p className="font-semibold">Search your connected context</p><p className="mt-1 text-sm text-slate-400">Find people, assets, events, and unresolved commitments in one place.</p><div className="mt-4 flex flex-wrap gap-2">{['Vehicle','Family','maintenance','follow up'].map(term=><button key={term} onClick={()=>setSearchText(term)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">{term}</button>)}</div></div>}</section>}

            {typeof current === 'object' && activeDetail && <section className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-[#0b1320] p-5 sm:p-7"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">{kindLabel[activeDetail.type]}</span>{activeDetail.type==='loop'&&<span className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase" style={{background:(priorityColor[activeDetail.priority??'normal'])+'20',color:priorityColor[activeDetail.priority??'normal']}}>{activeDetail.priority??'normal'} priority</span>}</div><button onClick={()=>setEditing((value)=>!value)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300">{editing?'Cancel':'Edit'}</button></div>{editing?<div className="space-y-3"><label className="block text-xs text-slate-500">Title<input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-base text-white outline-none focus:border-blue-400/60"/></label><label className="block text-xs text-slate-500">Notes<textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white outline-none focus:border-blue-400/60"/></label><button onClick={saveDetails} disabled={!editTitle.trim()} className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40">Save changes</button></div>:<><h2 className="text-2xl font-bold sm:text-3xl">{activeDetail.title}</h2><p className="mt-2 text-sm text-slate-400">Created {fmtTime(activeDetail.createdAt)}</p></>}
                {activeDetail.type==='loop'&&<div className="mt-5 flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs capitalize text-slate-300">{activeDetail.status}</span>{activeDetail.dueAt&&<span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300">Due {fmt(activeDetail.dueAt)}</span>}{activeDetail.waitingOn&&<span className="rounded-full border border-amber-400/20 px-3 py-1.5 text-xs text-amber-200">Waiting on {activeDetail.waitingOn}</span>}</div>}
                {!editing&&activeDetail.notes&&<p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{activeDetail.notes}</p>}
                {activeDetail.type==='loop'&&activeDetail.status!=='complete'&&<div className="mt-5 space-y-3"><div className="flex flex-wrap gap-2"><button onClick={()=>completeLoop(activeDetail)} className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950"><Check size={16}/> Close loop</button><select value={activeDetail.status??'open'} onChange={e=>setLoopStatus(activeDetail,e.target.value as LoopStatus)} className="rounded-xl border border-white/10 bg-slate-900 px-3 text-sm capitalize"><option value="open">Open</option><option value="active">Active</option><option value="waiting">Waiting</option><option value="blocked">Blocked</option></select></div><div className="grid gap-2 sm:grid-cols-3"><label className="text-xs text-slate-500">Priority<select value={activeDetail.priority??'normal'} onChange={e=>updateLoop(activeDetail,{priority:e.target.value as LoopPriority})} className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-slate-900 px-2 text-sm capitalize text-slate-200"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label className="text-xs text-slate-500">Due date<input type="date" value={activeDetail.dueAt?.slice(0,10)??''} onChange={e=>updateLoop(activeDetail,{dueAt:e.target.value?new Date(`${e.target.value}T12:00:00`).toISOString():null})} className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-slate-900 px-2 text-sm text-slate-200"/></label><label className="text-xs text-slate-500">Waiting on<input value={activeDetail.waitingOn??''} onChange={e=>updateLoop(activeDetail,{waitingOn:e.target.value||null})} placeholder="Person or dependency" className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-slate-900 px-2 text-sm text-slate-200"/></label></div></div>}
              </div>
              {activeDetail.type==='asset'&&<Panel title="Asset overview" icon={<Car size={16}/>}>{activeDetail.value!=null?<p className="text-sm">Value: {activeDetail.value.toLocaleString(undefined,{style:'currency',currency:'USD'})}</p>:<p className="text-sm text-slate-400">No value recorded.</p>}<p className="mt-2 text-xs text-slate-500">{activeDetail.assetType??'Asset'} · {(activeDetail.areas??[]).join(' · ')}</p></Panel>}
              {activeDetail.type==='person'&&<Panel title="Relationship context" icon={<UserRound size={16}/>}><p className="text-sm text-slate-400">{activeDetail.personType??'Person'} · {activeDetail.notes??'No relationship notes yet.'}</p><p className="mt-2 text-xs text-slate-500">Last updated {fmt(activeDetail.updatedAt)}</p></Panel>}
              <Panel title="Related context" icon={<Link2 size={16}/>}><div className="space-y-2">{related(activeDetail).map(item=><ObjectRow key={item.id} item={item} onClick={()=>push({detailId:item.id})} meta={kindLabel[item.type]}/>)}</div>{related(activeDetail).length===0&&<Empty text="Connect this record to a person, asset, event, or commitment."/>}<div className="mt-3 flex gap-2"><select value={linkTargetId} onChange={e=>setLinkTargetId(e.target.value)} className="min-h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-slate-300"><option value="">Link another record…</option>{objects.filter(x=>x.id!==activeDetail.id&&!activeDetail.relatedIds.includes(x.id)).map(x=><option key={x.id} value={x.id}>{x.title} · {kindLabel[x.type]}</option>)}</select><button onClick={linkContext} disabled={!linkTargetId} className="rounded-xl border border-blue-400/30 px-3 text-xs font-semibold text-blue-200 disabled:opacity-40">Link</button></div></Panel>
              <Panel title="Areas" icon={<SlidersHorizontal size={16}/>}><p className="mb-3 text-xs text-slate-500">Which part of life does this belong to?</p><div className="flex flex-wrap gap-2">{(activeDetail.areas??[]).map(area=><button key={area} onClick={()=>removeArea(area)} title="Remove area" className="rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1.5 text-xs text-blue-200">{area} ×</button>)}</div><form className="mt-3 flex gap-2" onSubmit={e=>{e.preventDefault();addArea();}}><input value={areaDraft} onChange={e=>setAreaDraft(e.target.value)} list="lifeos-area-suggestions" placeholder="Add an area…" className="min-h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-blue-400/50"/><datalist id="lifeos-area-suggestions">{['Health','Finances','Relationships','Work','Home','Growth','Vehicles','Family'].map(area=><option key={area} value={area}/>)}</datalist><button type="submit" disabled={!areaDraft.trim()} className="rounded-xl border border-blue-400/30 px-3 text-xs font-semibold text-blue-200 disabled:opacity-40">Add</button></form><div className="mt-3 flex flex-wrap gap-2">{['Health','Finances','Relationships','Work','Home','Growth'].filter(area=>!(activeDetail.areas??[]).includes(area)).map(area=><button key={area} onClick={()=>addArea(area)} className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-slate-400 hover:border-blue-400/40">{area} +</button>)}</div></Panel>
            </section>}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#090f19]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"><div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {([['home','Home',Home],['loops','Loops',CircleDot],['capture','Capture',Plus],['timeline','Timeline',CalendarDays],['search','Search',Search]] as const).map(([key,label,Icon])=><button key={key} onClick={()=>key==='capture'?openCapture():go(key)} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold ${(current===key || (key==='home'&&current==='home'))?'text-amber-300':'text-slate-500'}`}><span className={`grid h-7 w-9 place-items-center rounded-xl ${key==='capture'?'bg-amber-400 text-slate-950':' '}`}><Icon size={key==='capture'?21:18}/></span>{label}</button>)}
      </div></nav>

      {captureOpen&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setCaptureOpen(false);}}><section className="w-full max-w-xl rounded-t-3xl border border-white/10 bg-[#101a29] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">Universal Capture</p><h2 className="mt-1 text-xl font-bold">What happened?</h2></div><button onClick={()=>setCaptureOpen(false)} aria-label="Close capture" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400"><X size={18}/></button></div><form onSubmit={capture}><textarea autoFocus value={captureText} onChange={e=>setCaptureText(e.target.value)} rows={3} maxLength={1000} placeholder="Had annual physical. Need blood work next month." className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-4 text-base outline-none placeholder:text-slate-500 focus:border-amber-400/60"/><div className="mt-3 flex flex-wrap gap-2">{(['auto','event','loop','person','asset'] as const).map(k=><button type="button" key={k} onClick={()=>setCaptureKind(k)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${captureKind===k?'border-amber-400/60 bg-amber-400/10 text-amber-200':'border-white/10 text-slate-400'}`}>{k==='auto'?'Auto detect':k==='loop'?'Open loop':k}</button>)}</div><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs text-slate-500">Due date (optional)<input type="date" value={captureDueDate} onChange={e=>setCaptureDueDate(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-slate-300"/></label><label className="text-xs text-slate-500">Priority<select value={capturePriority} onChange={e=>setCapturePriority(e.target.value as LoopPriority)} className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-sm capitalize text-slate-300"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label></div><div className="mt-3"><label className="mb-1.5 block text-xs text-slate-500">Connect to existing context (optional)</label><select value={relatedId} onChange={e=>setRelatedId(e.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-slate-300"><option value="">No linked context</option>{objects.filter(x=>x.type==='person'||x.type==='asset').map(x=><option key={x.id} value={x.id}>{x.title} · {kindLabel[x.type]}</option>)}</select></div><div className="mt-4 flex items-center justify-between gap-3"><p className="text-[11px] text-slate-500">Auto creates an event and/or commitment from your words.</p><button type="submit" disabled={!captureText.trim()} className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 disabled:opacity-40"><Plus size={16}/> Capture</button></div></form></section></div>}
    </div>
  );
}

function Panel({title,icon,action,onAction,children}:{title:string;icon:ReactNode;action?:string;onAction?:()=>void;children:ReactNode}){
  return <section className="rounded-3xl border border-white/[.08] bg-[#0e1724] p-4 sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-bold">{<span className="text-blue-300">{icon}</span>}{title}</h2>{action&&<button onClick={onAction} className="text-xs font-semibold text-blue-300">{action}</button>}</div>{children}</section>;
}
function ObjectRow({item,onClick,meta}:{item:LifeObject;onClick:()=>void;meta:string}){
  const Icon=item.type==='event'?CalendarDays:item.type==='loop'?CircleDot:item.type==='person'?UserRound:Car;
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-white/[.06] bg-black/15 p-3 text-left transition hover:border-white/15"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.05] text-slate-300"><Icon size={16}/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{meta}</span></span><ChevronRight size={15} className="shrink-0 text-slate-600"/></button>;
}
function Empty({text}:{text:string}){return <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs leading-relaxed text-slate-500">{text}</div>;}
function LoopCard({item,onOpen,onComplete,onStatus}:{item:LifeObject;onOpen:()=>void;onComplete:()=>void;onStatus:(status:LoopStatus)=>void}){
  const priority=item.priority??'normal';
  return <article className="rounded-2xl border border-white/[.08] bg-[#0e1724] p-4"><div className="flex items-start gap-3"><button onClick={onComplete} aria-label={`Complete ${item.title}`} className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-600 text-transparent hover:border-emerald-400 hover:text-emerald-400"><Check size={14}/></button><button onClick={onOpen} className="min-w-0 flex-1 text-left"><p className="font-semibold">{item.title}</p><div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500"><span className="rounded-md px-2 py-1 capitalize" style={{background:priorityColor[priority]+'18',color:priorityColor[priority]}}>{priority}</span><span className="capitalize">{item.status}</span><span>Due {fmt(item.dueAt)}</span></div></button><button onClick={onOpen} aria-label="Open loop details" className="text-slate-600"><ChevronRight size={18}/></button></div><div className="mt-3 flex justify-end"><select aria-label="Change loop status" value={item.status??'open'} onChange={e=>onStatus(e.target.value as LoopStatus)} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] capitalize text-slate-400"><option value="open">Open</option><option value="active">Active</option><option value="waiting">Waiting</option><option value="blocked">Blocked</option></select></div></article>;
}
