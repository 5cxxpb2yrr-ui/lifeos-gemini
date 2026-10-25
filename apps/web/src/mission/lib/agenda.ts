import { addDays, daysUntil, iso, money, parse } from './dates';
import type { LifeData, Ref } from '../types';

export interface AgendaItem { date: string; title: string; sub: string; ref: Ref; days: number }

export function agenda(d: LifeData, now = new Date()): AgendaItem[] {
  const a: Omit<AgendaItem, 'days'>[] = [];
  for (const b of d.bills) if (b.remainingBalance > 0 && b.dueDate) a.push({ date: b.dueDate, title: 'Pay ' + b.title, sub: money(b.remainingBalance), ref: { type: 'bill', id: b.id } });
  for (const x of d.decisions) if (!x.reviewed && !x.actualOutcome && x.reviewDate) a.push({ date: x.reviewDate, title: 'Review: ' + x.title, sub: 'Decision', ref: { type: 'decision', id: x.id } });
  for (const p of d.people) if (p.lastContact && p.frequencyDays) a.push({ date: addDays(p.lastContact, p.frequencyDays), title: 'Contact ' + p.name, sub: `Every ${p.frequencyDays} days`, ref: { type: 'person', id: p.id } });
  return a.sort((x, y) => x.date.localeCompare(y.date)).map((x) => ({ ...x, days: daysUntil(x.date, now) }));
}
export const groupAgenda = (items: AgendaItem[]) => [
  { label: 'Overdue', items: items.filter((i) => i.days < 0) },
  { label: 'This week', items: items.filter((i) => i.days >= 0 && i.days <= 7) },
  { label: 'Later', items: items.filter((i) => i.days > 7 && i.days <= 60) },
];
/** Prefilled all-day Google Calendar event. */
export const calendarUrl = (a: { date: string; title: string; sub: string }) =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(a.title)}&dates=${a.date.replace(/-/g, '')}/${iso(parse(addDays(a.date, 1))).replace(/-/g, '')}&details=${encodeURIComponent(a.sub + ' · from LifeOS')}`;
