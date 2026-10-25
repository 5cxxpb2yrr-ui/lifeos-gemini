export type EntityType = 'Person' | 'Asset' | 'Account' | 'Utility' | 'Contract';
export interface Entity { id: string; name: string; type: EntityType; open: number }
const ORDER: EntityType[] = ['Person', 'Asset', 'Account', 'Utility', 'Contract'];

export function Entities({ entities, onOpen }: { entities: Entity[]; onOpen?: (id: string) => void }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Entities</h2>
      {ORDER.map((t) => {
        const list = entities.filter((e) => e.type === t);
        return list.length ? (
          <div key={t}>
            <h3 className="mb-2 mt-4 text-xs font-semibold text-[var(--text-2)]">{t}s</h3>
            {list.map((e) => (
              <button key={e.id} onClick={() => onOpen?.(e.id)} className="mb-2 flex min-h-12 w-full items-center justify-between rounded-[22px] border border-[var(--line)] bg-[var(--surface-1)] px-3 text-left">
                <span>{e.name}</span><span className="text-sm text-[var(--text-2)]">{e.open} open ›</span>
              </button>
            ))}
          </div>
        ) : null;
      })}
    </section>
  );
}
