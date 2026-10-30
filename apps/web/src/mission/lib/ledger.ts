import { addMonths, iso } from './dates';
import type { Bill, Decision, Goal, Insight, LifeData, Loop, PersonRec, Project } from '../types';
import type { Option } from './scoring';

const mapBy = <T extends { id: string | number }>(xs: T[] | undefined, id: string, f: (x: T) => T) => (xs ?? []).map((x) => (String(x.id) === id ? f(x) : x));

export const payBill = (d: LifeData, id: string, amount: number, now = new Date()): LifeData => ({
  ...d,
  bills: mapBy(d.bills, id, (b) => {
    let remaining = Math.max(0, Number((b.remainingBalance - amount).toFixed(2)));
    let due = b.dueDate;
    if (remaining === 0 && b.isRecurring) { remaining = b.originalBalance; if (due) due = addMonths(due, 1); }
    return { ...b, remainingBalance: remaining, dueDate: due, updatedAt: now.toISOString(),
      paymentHistory: [...(b.paymentHistory ?? []), { id: `pay_${now.getTime().toString(36)}`, date: iso(now), amount, note: 'Recorded in Mission Control' }] };
  }),
});
export const setTerms = (d: LifeData, id: string, t: { apr?: number; minimum?: number }, now = new Date()): LifeData =>
  ({ ...d, bills: mapBy(d.bills, id, (b) => ({ ...b, apr: t.apr, minimum: t.minimum, updatedAt: now.toISOString() })) });
export const addOption = (d: LifeData, id: string, o: Option, now = new Date()): LifeData =>
  ({ ...d, decisions: mapBy(d.decisions, id, (x) => ({ ...x, options: [...(x.options ?? []), o], updatedAt: now.toISOString() })) });
/** Choosing an option records the decision and marks it reviewed (it leaves the briefing). */
export const chooseOption = (d: LifeData, id: string, idx: number, now = new Date()): LifeData =>
  ({ ...d, decisions: mapBy(d.decisions, id, (x) => (x.options?.[idx] ? { ...x, chosen: x.options[idx].name, reviewed: true, decidedOn: iso(now), updatedAt: now.toISOString() } : x)) });
export const logContact = (d: LifeData, id: string, now = new Date()): LifeData =>
  ({ ...d, people: mapBy(d.people, id, (p) => ({ ...p, lastContact: iso(now), updatedAt: now.toISOString() })) });
export const savePerson = (d: LifeData, id: string, patch: { phone?: string; frequencyDays?: number }, now = new Date()): LifeData =>
  ({ ...d, people: mapBy(d.people, id, (p) => ({ ...p, ...patch, updatedAt: now.toISOString() })) });
export const addPerson = (d: LifeData, id: string, name: string, now = new Date()): LifeData =>
  ({ ...d, people: [...d.people, { id, name, relationship: '', updatedAt: now.toISOString() }] });

const SECTIONS = ['bills', 'decisions', 'loops', 'people', 'insights', 'projects', 'goals'];
const num = (v: unknown, f = 0) => { const n = Number(v); return Number.isFinite(n) ? n : f; };
const normBill = (x: Record<string, unknown>, n: number): Bill => ({
  ...(x as object), id: String(x.id ?? `imp_${n}`), title: String(x.title ?? x.name ?? 'Untitled'), payee: String(x.payee ?? x.vendor ?? ''),
  originalBalance: num(x.originalBalance ?? x.balance), remainingBalance: num(x.remainingBalance ?? x.balance),
  dueDate: x.dueDate ? String(x.dueDate) : undefined, isRecurring: Boolean(x.isRecurring ?? x.frequency),
  minimum: x.minimum === undefined && x.minPayment === undefined ? undefined : num(x.minimum ?? x.minPayment),
  paymentHistory: Array.isArray(x.paymentHistory) ? (x.paymentHistory as Bill['paymentHistory']) : [],
} as Bill);

/** Accepts a FULL_LIFE_CONTROL_BACKUP, or a ledger export (`records`/`ledger` array, or a bare array of bills). */
export function normalizeBackup(raw: unknown): LifeData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const arr = Array.isArray(raw) ? raw : r.bills ?? r.records ?? r.ledger;
  if (!Array.isArray(arr)) return null;
  const list = <T,>(k: string) => (Array.isArray(r[k]) ? (r[k] as T[]) : []);
  return {
    bills: arr.map((x, n) => normBill(x as Record<string, unknown>, n)),
    decisions: list<Decision>('decisions'), loops: list<Loop>('loops'), people: list<PersonRec>('people'), insights: list<Insight>('insights'), projects: list<Project>('projects'), goals: list<Goal>('goals'),
    extras: Array.isArray(raw) ? undefined : Object.fromEntries(Object.entries(r).filter(([k]) => !SECTIONS.includes(k))),
  };
}
/** Merge edits back over every untouched section so a full backup round-trips. */
export const exportBackup = (d: LifeData) => ({ ...d.extras, bills: d.bills, decisions: d.decisions, loops: d.loops, people: d.people, insights: d.insights, projects: d.projects, goals: d.goals });

export const addProject = (d: LifeData, id: string, title: string, now = new Date()): LifeData =>
  ({ ...d, projects: [...d.projects, { id, title, createdAt: now.toISOString(), updatedAt: now.toISOString() }] });
export const addGoal = (d: LifeData, id: string, title: string, now = new Date()): LifeData =>
  ({ ...d, goals: [...d.goals, { id, title, createdAt: now.toISOString(), updatedAt: now.toISOString() }] });
/** Percent complete (project) or progress (goal), 0-100. */
export const setProgress = (d: LifeData, kind: 'project' | 'goal', id: string, pct: number, now = new Date()): LifeData =>
  kind === 'goal'
    ? { ...d, goals: mapBy(d.goals, id, (g) => ({ ...g, progress: pct, updatedAt: now.toISOString() })) }
    : { ...d, projects: mapBy(d.projects, id, (p) => ({ ...p, completion: pct, updatedAt: now.toISOString() })) };
