export const startOfDay = (d = new Date()) => { const t = new Date(d); t.setHours(0, 0, 0, 0); return t; };
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parse = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00`);
/** Whole days from `now` to date `s` (negative = in the past). */
export const daysUntil = (s: string, now = new Date()) => Math.round((parse(s).getTime() - startOfDay(now).getTime()) / 864e5);
export const addDays = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
/** Month arithmetic that clamps to the last day (Oct 31 + 1 month = Nov 30, not Dec 1). */
export const addMonths = (s: string, n: number) => {
  const d = parse(s), day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return iso(d);
};
export const money = (n: number) => '$' + (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
export const ageDays = (s: string | undefined, now = new Date()) => (s ? -daysUntil(s, now) : null);
