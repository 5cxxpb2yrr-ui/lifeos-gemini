import { useState } from 'react';

export interface Searchable { id: string; title: string; subtitle?: string }

export function Search({ items, onOpen }: { items: Searchable[]; onOpen?: (id: string) => void }) {
  const [q, setQ] = useState('');
  const hits = items.filter((i) => `${i.title} ${i.subtitle ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Search</h2>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actions, people, accounts" aria-label="Search"
        className="mb-3 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-[var(--text)]" />
      {hits.length ? hits.map((i) => (
        <button key={i.id} onClick={() => onOpen?.(i.id)} className="mb-2 flex min-h-12 w-full items-center justify-between rounded-[22px] border border-[var(--line)] bg-[var(--surface-1)] px-3 text-left">
          <span>{i.title}<span className="block text-xs text-[var(--text-2)]">{i.subtitle}</span></span><span className="text-[var(--text-2)]">›</span>
        </button>
      )) : <p className="py-8 text-center text-[var(--text-2)]">No matches. Try a person or account name.</p>}
    </section>
  );
}
