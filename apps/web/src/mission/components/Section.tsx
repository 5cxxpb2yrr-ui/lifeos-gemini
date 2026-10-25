import type { ReactNode } from 'react';

/** Two columns for paired cards; a lone card spans the row. Use `full` for single full-width sections. */
export function Section({ children, full = false }: { children: ReactNode; full?: boolean }) {
  return <div className={full ? 'mb-3' : 'mb-3 grid grid-cols-2 gap-3 [&>*:only-child]:col-span-2'}>{children}</div>;
}
