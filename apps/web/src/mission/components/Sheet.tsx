import type { ReactNode } from 'react';

/** Bottom sheet on mobile and tablet; side context panel from lg. Breadcrumbs show the drill path. */
export function Sheet({ crumbs, onCrumb, onClose, children }: { crumbs: string[]; onCrumb: (i: number) => void; onClose: () => void; children: ReactNode }) {
  const open = crumbs.length > 0;
  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-10 bg-black/60 transition-opacity duration-[180ms] lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside className={`fixed inset-x-0 bottom-0 z-20 mx-auto max-h-[80vh] max-w-[560px] overflow-y-auto rounded-t-[28px] border border-[var(--line)] bg-[var(--surface-1)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] transition-transform duration-[240ms] lg:inset-y-4 lg:left-auto lg:right-4 lg:mx-0 lg:max-h-none lg:w-[344px] lg:rounded-[28px] ${open ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-[120%] lg:translate-y-0'}`}>
        {crumbs.length > 1 && (
          <nav className="mb-2 flex flex-wrap items-center gap-0.5 text-xs text-[var(--text-2)]" aria-label="Breadcrumb">
            <button onClick={onClose} className="min-h-8 px-1 text-[var(--blue)]">Mission</button>
            {crumbs.map((c, i) => (
              <span key={i}>› {i < crumbs.length - 1 ? <button onClick={() => onCrumb(i)} className="min-h-8 px-1 text-[var(--blue)]">{c}</button> : <b className="px-1 text-[var(--text)]">{c}</b>}</span>
            ))}
          </nav>
        )}
        {open && children}
      </aside>
    </>
  );
}
