import { labelOf } from '../types';

export interface Parsed { text: string; pri: number | null; ctx: string[]; people: string[]; proj: string[]; goal: string[]; trk: string[] }
export interface Person { id: string; name: string }

/** Universal Capture syntax: p1-p5, *context, @person, >project, ^goal, #tracker(value). */
export function parseCap(t: string): Parsed {
  const p: Parsed = { text: '', pri: null, ctx: [], people: [], proj: [], goal: [], trk: [] };
  const bucket: Record<string, string[]> = { '*': p.ctx, '@': p.people, '>': p.proj, '^': p.goal };
  const text = t
    .replace(/(^|\s)p([1-5])(?=\s|$)/g, (_, a: string, n: string) => { p.pri = Number(n); return a; })
    .replace(/(^|\s)#(\w+)(?:\(([^)]*)\))?/g, (_, a: string, n: string, v?: string) => { p.trk.push(n + (v ? `(${v})` : '')); return a; })
    .replace(/(^|\s)([*@>^])([\w.-]+)/g, (_, a: string, s: string, w: string) => { bucket[s].push(w); return a; });
  p.text = text.trim().replace(/\s+/g, ' ');
  return p;
}

/** Resolve an @tag to a person: exact name, name without spaces, or a unique first name. */
export function findPerson(tag: string, people: Person[]): Person | undefined {
  const n = tag.replace(/[._-]+/g, ' ').trim().toLowerCase();
  const first = (p: Person) => p.name.toLowerCase().split(' ')[0];
  const byFirst = people.filter((p) => first(p) === n);
  return (
    people.find((p) => p.name.toLowerCase() === n) ??
    people.find((p) => p.name.toLowerCase().replace(/\s/g, '') === n.replace(/\s/g, '')) ??
    (byFirst.length === 1 ? byFirst[0] : undefined)
  );
}

export const titleCase = (w: string) => w.replace(/[._-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());

export interface Titled { id: string | number; title?: string; name?: string }
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Resolve a >project or ^goal tag: the exact title (spaces optional), or every tag word starts a word in exactly one title. */
export function findByTitle<T extends Titled>(tag: string, items: T[]): T | undefined {
  const n = norm(tag);
  if (!n) return undefined;
  const flat = n.replace(/ /g, '');
  const exact = items.find((i) => norm(labelOf(i)) === n || norm(labelOf(i)).replace(/ /g, '') === flat);
  if (exact) return exact;
  const words = n.split(' ');
  const hits = items.filter((i) => { const t = norm(labelOf(i)).split(' '); return words.every((w) => t.some((x) => x.startsWith(w))); });
  return hits.length === 1 ? hits[0] : undefined;
}

/** Captures whose >project or ^goal tag resolves to this record. */
export function mentionsOf(texts: string[], kind: 'proj' | 'goal', pool: Titled[], id: string | number): string[] {
  return texts.filter((t) => parseCap(t)[kind].some((w) => { const h = findByTitle(w, pool); return h !== undefined && String(h.id) === String(id); }));
}
