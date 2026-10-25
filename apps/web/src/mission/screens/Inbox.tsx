import { useState } from 'react';
import { CaptureChips } from '../components/CaptureChips';
import { parseCap, type Person } from '../lib/capture';
import { useStore } from '../store';

const field = 'min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-[var(--text)]';

export function Inbox({ people, onPerson, onNewPerson }: { people: Person[]; onPerson?: (id: string) => void; onNewPerson?: (name: string) => void }) {
  const { inbox, archive, capture, archiveAt, restoreAt } = useStore();
  const [v, setV] = useState('');
  const row = (t: string, label: string, onClick: () => void, dim = false) => {
    const p = parseCap(t);
    return (
      <li key={label + t} className={`mb-2 flex items-center justify-between gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--surface-1)] p-3 ${dim ? 'opacity-70' : ''}`}>
        <div><p>{p.text || t}</p><CaptureChips parsed={p} people={people} onPerson={onPerson} onNew={onNewPerson} /></div>
        <button onClick={onClick} className="min-h-10 rounded-[20px] bg-[var(--surface-3)] px-4 text-sm font-semibold">{label}</button>
      </li>
    );
  };
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Inbox</h2>
      <form onSubmit={(e) => { e.preventDefault(); capture(v); setV(''); }} className="mb-4">
        <input className={field} value={v} onChange={(e) => setV(e.target.value)} placeholder="Call @Marcus p2 *phone ^mentorship" aria-label="Capture" />
        <CaptureChips parsed={parseCap(v)} people={people} />
        <p className="mt-1.5 text-xs text-[var(--text-2)]">p1–p5 priority · *context · @person · &gt;project · ^goal · #tracker(value)</p>
      </form>
      {inbox.length ? <ul>{inbox.map((t, i) => row(t, 'Archive', () => archiveAt(i)))}</ul> : <p className="py-8 text-center text-[var(--text-2)]">Inbox is clear. Capture a thought, bill, or task above.</p>}
      {archive.length > 0 && (<><h3 className="mb-2 mt-4 text-xs font-semibold text-[var(--text-2)]">Archived</h3><ul>{archive.map((t, i) => row(t, 'Restore', () => restoreAt(i), true))}</ul></>)}
    </section>
  );
}
