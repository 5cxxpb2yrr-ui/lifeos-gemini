export interface ReviewItem { id: string; title: string; note: string }

export function ReviewQueue({ items, onOpen }: { items: ReviewItem[]; onOpen?: (id: string) => void }) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-1)] p-3">
      <header className="mb-1 flex justify-between text-xs font-semibold text-[var(--text-2)]"><span>REVIEW QUEUE</span><span>{items.length} items</span></header>
      {items.map((i) => (
        <button key={i.id} onClick={() => onOpen?.(i.id)} className="flex min-h-11 w-full items-center justify-between border-t border-[var(--line)] text-left text-sm">
          <span>{i.title}</span><span className="text-xs text-[var(--text-2)]">{i.note}</span>
        </button>
      ))}
    </section>
  );
}
