const TABS = [['mission', '⌂', 'Mission'], ['inbox', '✉', 'Inbox'], ['entities', '⚇', 'Entities'], ['search', '⌕', 'Search'], ['more', '⋯', 'More']] as const;
export type Tab = (typeof TABS)[number][0];

/** Bottom bar on mobile and tablet; vertical rail from lg (1024px). */
export function BottomNavigation({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-[var(--line)] bg-[#0A0B0Dee] pb-[env(safe-area-inset-bottom)] backdrop-blur lg:inset-y-0 lg:right-auto lg:w-24 lg:flex-col lg:border-r lg:border-t-0 lg:pt-4">
      {TABS.map(([k, icon, label]) => (
        <button key={k} onClick={() => onChange(k)} className={`min-h-12 flex-1 text-[11px] lg:flex-none lg:py-4 ${tab === k ? 'text-[var(--blue)]' : 'text-[var(--text-2)]'}`}>
          <span className="block text-xl leading-tight">{icon}</span>{label}
        </button>
      ))}
    </nav>
  );
}
