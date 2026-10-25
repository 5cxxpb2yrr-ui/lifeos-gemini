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
