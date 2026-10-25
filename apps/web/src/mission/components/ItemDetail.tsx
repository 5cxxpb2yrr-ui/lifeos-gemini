import { findGoalByTitle, findProjectByTitle, type Parsed } from '../lib/capture';

const chip = 'rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-0.5 text-xs text-[var(--text-2)]';

export function CaptureChips({ parsed, people, projects = [], goals = [], onPerson, onProject, onGoal, onNew }: {
  parsed: Parsed; people: { id: string; name: string }[]; projects?: { id: string; title: string }[]; goals?: { id: string; title: string }[];
  onPerson?: (id: string) => void; onProject?: (id: string) => void; onGoal?: (id: string) => void; onNew?: (name: string) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {parsed.pri && <span className={`${chip} ${parsed.pri <= 2 ? 'border-[#EF444488] text-[var(--critical)]' : ''}`}>P{parsed.pri}</span>}
      {parsed.ctx.map((w) => <span key={`c${w}`} className={chip}>*{w}</span>)}
      {parsed.people.map((w) => {
        const q = people.find((p) => p.name.toLowerCase() === w.toLowerCase()) ?? people.find((p) => p.name.toLowerCase().replace(/\s+/g, '') === w.toLowerCase().replace(/\s+/g, ''));
        return q
          ? <button key={`p${w}`} onClick={() => onPerson?.(q.id)} className={`${chip} border-[#22C55E66] text-[var(--opp)]`}>@{q.name} ✓</button>
          : onNew
            ? <button key={`p${w}`} onClick={() => onNew(w)} className={`${chip} border-[#F59E0B66] text-[var(--risk)]`}>@{w} · add</button>
            : <span key={`p${w}`} className={`${chip} border-[#F59E0B66] text-[var(--risk)]`}>@{w} · new</span>;
      })}
      {parsed.proj.map((w) => {
        const project = projects.find((p) => p.title.toLowerCase() === w.toLowerCase()) ?? projects.find((p) => p.title.toLowerCase().replace(/\s+/g, '') === w.toLowerCase().replace(/\s+/g, ''));
        return project
          ? <button key={`j${w}`} onClick={() => onProject?.(project.id)} className={`${chip} border-[#3B82F666] text-[var(--blue)]`}>&gt;{project.title}</button>
          : <span key={`j${w}`} className={chip}>&gt;{w}</span>;
      })}
      {parsed.goal.map((w) => {
        const goal = goals.find((g) => g.title.toLowerCase() === w.toLowerCase()) ?? goals.find((g) => g.title.toLowerCase().replace(/\s+/g, '') === w.toLowerCase().replace(/\s+/g, ''));
        return goal
          ? <button key={`g${w}`} onClick={() => onGoal?.(goal.id)} className={`${chip} border-[#F59E0B66] text-[var(--risk)]`}>^{goal.title}</button>
          : <span key={`g${w}`} className={chip}>^{w}</span>;
      })}
      {parsed.trk.map((w) => <span key={`t${w}`} className={chip}>#{w}</span>)}
    </div>
  );
}
