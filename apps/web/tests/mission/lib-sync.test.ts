import { describe, expect, it } from 'vitest';
import { SEED } from '../../src/mission/seed';
import { merge, mergeUi, stamp, toRecords } from '../../src/mission/lib/sync';
import * as L from '../../src/mission/lib/ledger';

const NOW = new Date('2026-10-25T12:00:00Z');

describe('sync merge', () => {
  it('pushes everything when the server is empty, and nothing changes locally', () => {
    const m = merge(SEED, []);
    expect(m.changed).toBe(false);
    expect(m.push).toHaveLength(toRecords(SEED).length);
  });
  it('is a no-op when both sides match', () => {
    const m = merge(SEED, toRecords(SEED));
    expect([m.changed, m.push.length]).toEqual([false, 0]);
  });
  it('local edits newer than the server are pushed', () => {
    const local = L.payBill(SEED, SEED.bills[2].id, 5, NOW);
    const m = merge(local, toRecords(SEED));
    expect(m.push.map((r) => r.id)).toEqual([SEED.bills[2].id]);
    expect(m.changed).toBe(false);
  });
  it('remote edits newer than local are adopted, and remote-only records are added', () => {
    const remoteData = L.addPerson(L.logContact(SEED, SEED.people[0].id, NOW), 'p_new', 'Dana Lee', NOW);
    const m = merge(SEED, toRecords(remoteData));
    expect(m.changed).toBe(true);
    expect(m.data.people.find((p) => p.id === SEED.people[0].id)?.lastContact).toBe('2026-10-25');
    expect(m.data.people.some((p) => p.id === 'p_new')).toBe(true);
    expect(m.push).toHaveLength(0);
  });
  it('never deletes: a record missing on the server stays and is pushed', () => {
    const remote = toRecords(SEED).filter((r) => r.table !== 'goal');
    const m = merge(SEED, remote);
    expect(m.data.goals).toHaveLength(SEED.goals.length);
    expect(m.push.every((r) => r.table === 'goal')).toBe(true);
  });
  it('reads epoch-number createdAt values', () => {
    expect(stamp({ createdAt: 1788457404135 })).toBe(new Date(1788457404135).toISOString());
    expect(stamp({})).toBe('1970-01-01T00:00:00.000Z');
  });
});

describe('sync ui document', () => {
  const doc = { table: 'kv' as const, id: 'ui', updatedAt: '2026-10-25T10:00:00.000Z', data: { inbox: ['a'], archive: [], weights: {}, resolved: {} } };
  it('adopts a newer remote, pushes a newer local, and skips when nothing changed', () => {
    expect(mergeUi('', doc).adopt?.inbox).toEqual(['a']);
    expect(mergeUi('2026-10-25T11:00:00.000Z', doc)).toEqual({ adopt: null, push: true });
    expect(mergeUi(doc.updatedAt, doc)).toEqual({ adopt: null, push: false });
    expect(mergeUi('', undefined)).toEqual({ adopt: null, push: false });
  });
});
