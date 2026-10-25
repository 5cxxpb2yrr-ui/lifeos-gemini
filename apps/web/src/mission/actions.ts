import { calendarUrl } from './lib/agenda';
import { addDays, iso, startOfDay } from './lib/dates';
import type { Nav } from './nav';
import type { Rec } from './types';

/** Card taps open sheets; inside a sheet an action drills deeper or resolves the item. */
export function runAction(rec: Rec, a: string, nav: Nav, resolveItem: (id: string) => void, inDetail: boolean, now = new Date()) {
  const go = inDetail ? nav.push : nav.open;
  const r = rec.ref;
  if (r?.type === 'bill') {
    if (a === 'Open bill') return go({ kind: 'bill', id: r.id });
    if (a === 'Record payment') return go({ kind: 'pay', id: r.id });
  }
  if (r?.type === 'person') {
    if (a === 'Schedule') { window.open(calendarUrl({ date: addDays(iso(startOfDay(now)), 1), title: 'Catch up with ' + rec.title, sub: 'Relationship repair' }), '_blank', 'noopener'); return; }
    return go({ kind: 'person', id: r.id });
  }
  if (!inDetail) return nav.open({ kind: 'item', id: rec.id });
  resolveItem(rec.id);
  nav.close();
}
