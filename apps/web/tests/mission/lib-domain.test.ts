import { describe, expect, it } from 'vitest';
import { SEED } from '../../src/mission/seed';
import { agenda, groupAgenda } from '../../src/mission/lib/agenda';
import { health } from '../../src/mission/lib/health';
import { balanceSeries, projection } from '../../src/mission/lib/loans';
import * as L from '../../src/mission/lib/ledger';
import { pickHero, resolve } from '../../src/mission/lib/resolve';

const NOW = new Date('2026-10-24T12:00:00');

describe('resolve (seed)', () => {
  const { items } = resolve(SEED, undefined, NOW);
  it('ranks by expected value (impact x confidence)', () => {
    const h = pickHero(items);
    expect([h.title, h.impact, h.confidence]).toEqual(['Pay HVAC Repair', 82, 100]);
  });
  it('builds the sections', () => {
    expect(items.filter((i) => i.kind === 'execute')).toHaveLength(5);
    expect(items.filter((i) => i.kind === 'decision')).toHaveLength(3);
    expect(items.find((i) => i.kind === 'relationship')?.context).toBe('No communication in 53 days');
  });
  it('scores health and agenda', () => {
    expect(health(SEED, 0, NOW).score).toBe(39);
    expect(groupAgenda(agenda(SEED, NOW)).map((g) => g.items.length)).toEqual([8, 1, 0]);
  });
});

describe('ledger', () => {
  const bill = { id: 'b', title: 'Loan', originalBalance: 1000, remainingBalance: 1000, dueDate: '2026-10-31', isRecurring: true, paymentHistory: [] };
  const base = { ...SEED, bills: [bill] };
  it('records a payment', () => {
    const b = L.payBill(base, 'b', 250, NOW).bills[0];
    expect([b.remainingBalance, b.paymentHistory?.[0].date]).toEqual([750, '2026-10-24']);
  });
  it('resets a recurring bill when fully paid and rolls the due date', () => {
    const b = L.payBill(base, 'b', 1000, NOW).bills[0];
    expect([b.remainingBalance, b.dueDate]).toEqual([1000, '2026-11-30']);
  });
  it('chooses an option and marks the decision reviewed', () => {
    const d0 = SEED.decisions[0].id;
    let d = L.addOption(SEED, d0, { name: 'PPO', value: 4, safety: 4, fit: 3 }, NOW);
    d = L.chooseOption(d, d0, 0, NOW);
    expect(d.decisions[0]).toMatchObject({ chosen: 'PPO', reviewed: true });
    expect(resolve(d, undefined, NOW).items.some((i) => i.id === 'd' + d0)).toBe(false);
  });
  it('imports a ledger export and round-trips a full backup', () => {
    expect(L.normalizeBackup({ records: [{ name: 'Gas', balance: 40, dueDate: '2026-11-01' }] })?.bills[0]).toMatchObject({ title: 'Gas', remainingBalance: 40 });
    const full = { ...L.exportBackup(SEED), keepMe: { a: 1 } };
    expect(L.exportBackup(L.normalizeBackup(full)!)).toEqual(full);
    expect(L.normalizeBackup('nope')).toBeNull();
  });
});

describe('loans', () => {
  it('projects payoff at minimum, +$50 and +$100', () => {
    const rows = projection(3000, 6.9, 412.5, NOW);
    expect(rows.map((r) => r.plan?.months)).toEqual([8, 7, 6]);
    expect(rows[0].plan?.interest).toBeCloseTo(73.63, 1);
    expect(projection(1000, 24, 10, NOW)[0].plan).toBeNull();
  });
  it('rebuilds balance history from payments', () => {
    const s = balanceSeries({ id: 'x', title: 'x', originalBalance: 500, remainingBalance: 200, paymentHistory: [{ date: '2026-02-01', amount: 100 }, { date: '2026-01-01', amount: 200 }] });
    expect(s.values).toEqual([500, 300, 200]);
  });
});
