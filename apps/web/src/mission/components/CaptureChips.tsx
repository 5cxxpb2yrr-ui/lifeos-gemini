import { findPerson, type Parsed, type Person } from '../lib/capture';

const chip = 'rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-0.5 text-xs text-[var(--text-2)]';

export function CaptureChips({ parsed, people, onPerson, onNew }: { parsed: Parsed; people: Person[]; onPerson?: (id: string) => void; onNew?: (name: string) => void }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {parsed.pri && <span className={`${chip} ${parsed.pri <= 2 ? 'border-[#EF444488] text-[var(--critical)]' : ''}`}>P{parsed.pri}</span>}
      {parsed.ctx.map((w) => <span key={`c${w}`} className={chip}>*{w}</span>)}
      {parsed.people.map((w) => {
        const q = findPerson(w, people);
        return q
          ? <button key={`p${w}`} onClick={() => onPerson?.(q.id)} className={`${chip} border-[#22C55E66] text-[var(--opp)]`}>@{q.name} ✓</button>
          : onNew
            ? <button key={`p${w}`} onClick={() => onNew(w)} className={`${chip} border-[#F59E0B66] text-[var(--risk)]`}>@{w} · add</button>
            : <span key={`p${w}`} className={`${chip} border-[#F59E0B66] text-[var(--risk)]`}>@{w} · new</span>;
      })}
      {parsed.proj.map((w) => <span key={`j${w}`} className={chip}>&gt;{w}</span>)}
      {parsed.goal.map((w) => <span key={`g${w}`} className={chip}>^{w}</span>)}
      {parsed.trk.map((w) => <span key={`t${w}`} className={chip}>#{w}</span>)}
    </div>
  );
}
