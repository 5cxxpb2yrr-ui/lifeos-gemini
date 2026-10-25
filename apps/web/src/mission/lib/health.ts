import { ageDays, daysUntil } from './dates';
import type { LifeData } from '../types';

export type HealthGo = 'agenda' | 'now' | 'context' | 'inbox';
export interface HealthRow { label: string; count: number; go: HealthGo }

export function health(d: LifeData, inboxCount: number, now = new Date()) {
  const open = d.decisions.filter((x) => !x.reviewed && !x.actualOutcome);
  const rows: HealthRow[] = [
    { label: 'Overdue bills', count: d.bills.filter((b) => b.remainingBalance > 0 && b.dueDate && daysUntil(b.dueDate, now) < 0).length, go: 'agenda' },
    { label: 'Loops open over 14 days', count: d.loops.filter((l) => l.status === 'active' && (ageDays(l.createdDate, now) ?? 0) > 14).length, go: 'now' },
    { label: 'Decisions past review date', count: open.filter((x) => x.reviewDate && daysUntil(x.reviewDate, now) < 0).length, go: 'agenda' },
    { label: 'People overdue for contact', count: d.people.filter((p) => p.lastContact && p.frequencyDays && (ageDays(p.lastContact, now) ?? 0) >= p.frequencyDays).length, go: 'context' },
    { label: 'Inbox to process', count: inboxCount, go: 'inbox' },
  ];
  const [od, ol, pd, op, ib] = rows.map((r) => r.count);
  return { score: Math.max(0, 100 - 8 * od - 5 * ol - 5 * pd - 6 * op - 2 * ib), rows };
}
