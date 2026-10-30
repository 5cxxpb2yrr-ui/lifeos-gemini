import { useEffect, useMemo, useState } from 'react';
import './theme/tokens.css';
import { runAction } from './actions';
import { BillSheet } from './components/BillSheet';
import { PayForm, TermsForm } from './components/BillForms';
import { BottomNavigation, type Tab } from './components/BottomNavigation';
import { ItemDetail } from './components/ItemDetail';
import { OptionForm } from './components/OptionsPanel';
import { LinkSheet } from './components/LinkSheet';
import { PersonSheet } from './components/PersonSheet';
import { Sheet } from './components/Sheet';
import { mentionsOf, titleCase } from './lib/capture';
import { labelOf } from './types';
import { resolve } from './lib/resolve';
import type { Nav, View } from './nav';
import { Entities, type Entity } from './screens/Entities';
import { Inbox } from './screens/Inbox';
import { Mission } from './screens/Mission';
import { More } from './screens/More';
import { Search, type Searchable } from './screens/Search';
import { Agenda, Memory, People, SystemCheck, type ViewName } from './screens/Views';
import { isLive, useStore } from './store';
import type { Kind, Rec, Ref } from './types';
import { startSync } from './syncRunner';
import { row } from './ui';

const KIND_TITLE: Record<Kind, string> = { execute: 'Execute now', decision: 'Decisions required', risk: 'At risk', waiting: 'Waiting', relationship: 'Relationship repairs' };

export default function MissionApp() {
  const [tab, setTab] = useState<Tab>('mission');
  const [view, setView] = useState<ViewName | null>(null);
  const [stack, setStack] = useState<View[]>([]);
  const { data, weights, resolved, inbox, archive, resolveItem, addPerson, addProject, addGoal } = useStore();
  useEffect(() => startSync(), []);

  const items = useMemo(() => resolve(data, weights), [data, weights]);
  const live = useMemo(() => items.items.filter((r) => isLive(resolved, r.id)), [items, resolved]);

  const nav: Nav = {
    open: (v) => setStack([v]), push: (v) => setStack((s) => [...s, v]),
    pop: () => setStack((s) => s.slice(0, -1)), close: () => setStack([]),
  };
  const act = (rec: Rec, a: string, inDetail = false) => runAction(rec, a, nav, resolveItem, inDetail);
  const label = (v: View) => {
    switch (v.kind) {
      case 'item': return live.find((r) => r.id === v.id)?.title.slice(0, 22) ?? 'Item';
      case 'bill': return data.bills.find((b) => b.id === v.id)?.title.slice(0, 22) ?? 'Bill';
      case 'person': return data.people.find((p) => p.id === v.id)?.name.slice(0, 22) ?? 'Person';
      case 'project': return data.projects.find((p) => String(p.id) === v.id)?.title.slice(0, 22) ?? 'Project';
      case 'goal': return (() => { const g = data.goals.find((x) => String(x.id) === v.id); return g ? labelOf(g).slice(0, 22) : 'Goal'; })();
      case 'pay': return 'Payment';
      case 'terms': return 'Terms';
      case 'option': return 'Option';
      default: return 'List';
    }
  };
  const openRef = (r: Ref) => {
    if (r.type === 'bill') nav.open({ kind: 'bill', id: r.id });
    else if (r.type === 'person') nav.open({ kind: 'person', id: r.id });
    else if (r.type === 'decision') { const it = live.find((x) => x.ref?.type === 'decision' && x.ref.id === r.id); if (it) nav.open({ kind: 'item', id: it.id }); }
  };
  const newPerson = (name: string) => nav.open({ kind: 'person', id: addPerson(titleCase(name)) });
  const newProject = (name: string) => nav.open({ kind: 'project', id: addProject(titleCase(name)) });
  const newGoal = (name: string) => nav.open({ kind: 'goal', id: addGoal(titleCase(name)) });
  const texts = [...inbox, ...archive];
  const goTab = (t: Tab) => { setTab(t); setView(null); };

  const entities: Entity[] = [
    ...data.people.map((p) => ({ id: `person:${p.id}`, name: p.name, type: 'Person' as const, open: live.filter((r) => r.ref?.id === p.id && r.ref.type === 'person').length })),
    ...data.bills.map((b) => ({ id: `bill:${b.id}`, name: b.title, type: 'Account' as const, open: live.filter((r) => r.ref?.type === 'bill' && r.ref.id === b.id).length })),
    ...data.projects.map((p) => ({ id: `project:${p.id}`, name: p.title, type: 'Project' as const, open: mentionsOf(texts, 'proj', data.projects, p.id).length })),
    ...data.goals.map((g) => ({ id: `goal:${g.id}`, name: labelOf(g), type: 'Goal' as const, open: mentionsOf(texts, 'goal', data.goals, g.id).length })),
  ];
  const searchable: Searchable[] = [
    ...live.map((r) => ({ id: `rec:${r.id}`, title: r.title, subtitle: r.entity })),
    ...data.people.map((p) => ({ id: `person:${p.id}`, title: p.name, subtitle: 'Person' })),
    ...data.bills.map((b) => ({ id: `bill:${b.id}`, title: b.title, subtitle: b.payee || 'Bill' })),
    ...data.projects.map((p) => ({ id: `project:${p.id}`, title: p.title, subtitle: 'Project' })),
    ...data.goals.map((g) => ({ id: `goal:${g.id}`, title: labelOf(g), subtitle: 'Goal' })),
  ];
  const openId = (id: string) => {
    const [t, ...rest] = id.split(':'), v = rest.join(':');
    if (t === 'rec') nav.open({ kind: 'item', id: v });
    else if (t === 'person') nav.open({ kind: 'person', id: v });
    else if (t === 'bill') nav.open({ kind: 'bill', id: v });
    else if (t === 'project') nav.open({ kind: 'project', id: v });
    else if (t === 'goal') nav.open({ kind: 'goal', id: v });
  };

  const top = stack[stack.length - 1];
  const bill = top && data.bills.find((b) => b.id === top.id);
  let body = null;
  if (top?.kind === 'item') { const r = live.find((x) => x.id === top.id); body = r && <ItemDetail rec={r} data={data} nav={nav} onAct={(rec, a) => act(rec, a, true)} />; }
  else if (top?.kind === 'bill') body = bill && <BillSheet bill={bill} nav={nav} />;
  else if (top?.kind === 'pay') body = bill && <PayForm bill={bill} nav={nav} />;
  else if (top?.kind === 'terms') body = bill && <TermsForm bill={bill} nav={nav} />;
  else if (top?.kind === 'person') { const p = data.people.find((x) => x.id === top.id); body = p && <PersonSheet person={p} nav={nav} />; }
  else if (top?.kind === 'project') { const p = data.projects.find((x) => String(x.id) === top.id); body = p && <LinkSheet kind="project" item={p} nav={nav} />; }
  else if (top?.kind === 'goal') { const g = data.goals.find((x) => String(x.id) === top.id); body = g && <LinkSheet kind="goal" item={g} nav={nav} />; }
  else if (top?.kind === 'option') { const d = data.decisions.find((x) => x.id === top.id); body = d && <OptionForm decision={d} nav={nav} />; }
  else if (top?.kind === 'list') {
    const k = top.id as Kind;
    body = (<div><h2 className="mb-2 text-xl font-semibold">{KIND_TITLE[k]}</h2>{live.filter((r) => r.kind === k).map((r) => (
      <button key={r.id} onClick={() => nav.push({ kind: 'item', id: r.id })} className={row}><span>{r.title}<span className="block text-xs text-[var(--text-2)]">{r.context}</span></span><span className="text-[var(--text-2)]">›</span></button>
    ))}</div>);
  }

  const back = () => setView(null);
  const personOpen = (id: string) => nav.open({ kind: 'person', id });
  return (
    <div className="mission-root min-h-screen bg-[var(--bg)] text-[var(--text)] mx-auto max-w-[860px] px-3.5 pb-32 pt-3 lg:ml-24 lg:max-w-none lg:pr-[360px]">
      <header className="mb-3"><h1 className="text-3xl font-bold">Life<span className="text-[var(--blue)]">OS</span></h1><p className="text-[var(--text-2)]">Mission Control</p></header>
      <main className="mx-auto max-w-[860px]">
        {tab === 'mission' && !view && <Mission items={live} queue={items.queue} onAction={(r, a) => act(r, a)} onMore={(k) => nav.open({ kind: 'list', id: k })} />}
        {tab === 'mission' && view === 'health' && <SystemCheck data={data} inboxCount={inbox.length} onBack={back} go={(g) => (g === 'inbox' ? goTab('inbox') : g === 'now' ? back() : setView(g === 'agenda' ? 'agenda' : 'context'))} />}
        {tab === 'mission' && view === 'agenda' && <Agenda data={data} open={openRef} onBack={back} />}
        {tab === 'mission' && view === 'context' && <People data={data} open={personOpen} onAdd={newPerson} onBack={back} />}
        {tab === 'mission' && view === 'memory' && <Memory data={data} archive={archive} open={(id) => nav.open({ kind: 'bill', id })} onBack={back} />}
        {tab === 'inbox' && <Inbox people={data.people} onPerson={personOpen} onNewPerson={newPerson} links={{ projects: data.projects, goals: data.goals, onProject: (id) => nav.open({ kind: 'project', id }), onGoal: (id) => nav.open({ kind: 'goal', id }), onNewProject: newProject, onNewGoal: newGoal }} />}
        {tab === 'entities' && <Entities entities={entities} onOpen={openId} />}
        {tab === 'search' && <Search items={searchable} onOpen={openId} />}
        {tab === 'more' && <More onView={(v) => { setTab('mission'); setView(v); }} />}
      </main>
      <Sheet crumbs={body ? stack.map(label) : []} onCrumb={(i) => setStack((s) => s.slice(0, i + 1))} onClose={nav.close}>{body}</Sheet>
      <BottomNavigation tab={tab} onChange={goTab} />
    </div>
  );
}
