import { labelOf } from '../types';
import { findByTitle, findPerson, type Parsed, type Person, type Titled } from '../lib/capture';

const chip = 'rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-0.5 text-xs text-[var(--text-2)]';
const ok = 'border-[#22C55E66] text-[var(--opp)]';
const add = 'border-[#F59E0B66] text-[var(--risk)]';

export interface Links { projects?: Titled[]; goals?: Titled[]; onProject?: (id: string) => void; onGoal?: (id: string) => void; onNewProject?: (name: string) => void; onNewGoal?: (name: string) => void }
interface Props extends Links { parsed: Parsed; people: Person[]; onPerson?: (id: string) => void; onNew?: (name: string) => void }

/** A resolved tag is a green chip that opens the record; an unknown tag offers to add it when a handler is given. */
function link(sym: string, w: string, hit: Titled | undefined, open?: (id: string) => void, create?: (name: string) => void) {
  if (hit) return <button key={sym + w} onClick={() => open?.(String(hit.id))} className={`${chip} ${ok}`}>{sym}{labelOf(hit)} ✓</button>;
  if (create) return <button key={sym + w} onClick={() => create(w)} className={`${chip} ${add}`}>{sym}{w} · add</button>;
  return <span key={sym + w} className={`${chip} ${add}`}>{sym}{w} · new</span>;
}

export function CaptureChips({ parsed, people, projects = [], goals = [], onPerson, onNew, onProject, onGoal, onNewProject, onNewGoal }: Props) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {parsed.pri && <span className={`${chip} ${parsed.pri <= 2 ? 'border-[#EF444488] text-[var(--critical)]' : ''}`}>P{parsed.pri}</span>}
      {parsed.ctx.map((w) => <span key={`c${w}`} className={chip}>*{w}</span>)}
      {parsed.people.map((w) => { const q = findPerson(w, people); return q ? <button key={`p${w}`} onClick={() => onPerson?.(q.id)} className={`${chip} ${ok}`}>@{q.name} ✓</button> : onNew ? <button key={`p${w}`} onClick={() => onNew(w)} className={`${chip} ${add}`}>@{w} · add</button> : <span key={`p${w}`} className={`${chip} ${add}`}>@{w} · new</span>; })}
      {parsed.proj.map((w) => link('>', w, findByTitle(w, projects), onProject, onNewProject))}
      {parsed.goal.map((w) => link('^', w, findByTitle(w, goals), onGoal, onNewGoal))}
      {parsed.trk.map((w) => <span key={`t${w}`} className={chip}>#{w}</span>)}
    </div>
  );
}
