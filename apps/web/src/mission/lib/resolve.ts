import { ageDays, daysUntil, money } from './dates';
import { completeness, DEFAULT_WEIGHTS, exposure, freshness, recommend, score, urgency, type Weights } from './scoring';
import type { LifeData, Rec } from '../types';

export interface QueueItem { id: string; title: string; note: string }
export interface Resolved { items: Rec[]; queue: QueueItem[] }
const rec = (o: object) => o as unknown as Record<string, unknown>;

/** Turns records into scored recommendations. Pure: pass `now` for repeatable results. */
export function resolve(d: LifeData, w: Weights = DEFAULT_WEIGHTS, now = new Date()): Resolved {
  const items: Rec[] = [];
  for (const b of d.bills) {
    if (!(b.remainingBalance > 0)) continue;
    const n = b.dueDate ? daysUntil(b.dueDate, now) : 999;
    if (!(n <= 30)) continue;
    const s = score({ urgency: urgency(n), exposure: exposure(b.remainingBalance), consequence: 0.7,
      completeness: completeness(rec(b), ['title', 'payee', 'dueDate', 'category', 'originalBalance']), freshness: freshness(ageDays(b.updatedAt, now)) }, w);
    const to = b.payee || b.title;
    items.push({ id: 'b' + b.id, kind: 'execute', ref: { type: 'bill', id: b.id }, entity: to, title: 'Pay ' + b.title,
      context: n < 0 ? `Overdue by ${-n} days` : n === 0 ? 'Due today' : `Due in ${n} days`, hot: n <= 4,
      recommendation: `Pay ${money(b.remainingBalance)} to ${to}`, outcome: `Pay ${money(b.remainingBalance)} to ${to} and avoid late fees.`,
      why: `Remaining ${money(b.remainingBalance)}, due ${b.dueDate}.`, impact: s.impact, confidence: s.confidence, factors: s.factors, actions: ['Record payment', 'Open bill'] });
  }
  for (const x of d.decisions) {
    if (x.reviewed || x.actualOutcome) continue;
    const s = score({ urgency: x.reviewDate ? urgency(daysUntil(x.reviewDate, now)) : 0.3, exposure: { High: 0.9, Medium: 0.6, Low: 0.3 }[x.risk ?? 'Medium'] ?? 0.5, consequence: 0.7,
      completeness: completeness(rec(x), ['title', 'context', 'expectedOutcome', 'reviewDate']), freshness: freshness(ageDays(x.updatedAt ?? x.createdAt, now)) }, w);
    const best = recommend(x.options);
    items.push({ id: 'd' + x.id, kind: 'decision', ref: { type: 'decision', id: x.id }, entity: 'Decisions', title: x.title,
      context: x.reviewDate ? `Review by ${x.reviewDate}` : 'Needs a decision', recommendation: best ? `Recommended: ${best.name}` : 'Add options to get a recommendation',
      outcome: x.expectedOutcome, why: x.context, impact: s.impact, confidence: x.confidence || s.confidence, factors: s.factors, actions: ['Mark decided'] });
  }
  for (const p of d.people) {
    if (!p.lastContact || !p.frequencyDays) continue;
    const g = ageDays(p.lastContact, now) ?? 0;
    if (g < p.frequencyDays) continue;
    const s = score({ urgency: Math.min(1, 0.5 + (g - p.frequencyDays) / p.frequencyDays / 4), exposure: 0.3, consequence: 0.5,
      completeness: completeness(rec(p), ['name', 'relationship', 'lastContact', 'frequencyDays']), freshness: freshness(ageDays(p.updatedAt ?? p.lastContact, now)) }, w);
    items.push({ id: 'p' + p.id, kind: 'relationship', ref: { type: 'person', id: p.id }, entity: p.name, title: p.name, context: `No communication in ${g} days`,
      recommendation: 'Schedule a catch-up call.', outcome: 'Reconnect before the gap grows.', why: `${p.relationship ? p.relationship + '. ' : ''}You aim to connect every ${p.frequencyDays} days.`,
      impact: s.impact, confidence: s.confidence, factors: s.factors, actions: ['Call', 'Text', 'Schedule'] });
  }
  for (const l of d.loops.filter((l) => l.status === 'waiting').slice(0, 2))
    items.push({ id: 'l' + l.id, kind: 'waiting', ref: { type: 'loop', id: l.id }, entity: 'Loops', title: l.title, context: `Waiting since ${l.createdDate ?? '—'}`,
      outcome: 'Close the loop once you hear back.', impact: 50, confidence: 80, actions: ['Mark done'] });
  for (const x of d.insights.filter((i) => i.tone === 'warning' && !(d.people.length && /No contact with/.test(i.text ?? ''))))
    items.push({ id: 'i' + x.id, kind: 'risk', ref: { type: 'insight', id: x.id }, entity: 'Insights', title: x.text ?? 'Warning', context: 'Flagged by LifeOS insights', impact: 85, confidence: 75, actions: ['Review'] });

  const queue = d.loops.filter((l) => l.status === 'active').slice(0, 3).map((l) => ({ id: l.id, title: l.title, note: `Open since ${l.createdDate ?? '—'}` }));
  return { items, queue };
}
export const pickHero = (items: Rec[]) => [...items].sort((a, b) => b.impact * b.confidence - a.impact * a.confidence)[0];
