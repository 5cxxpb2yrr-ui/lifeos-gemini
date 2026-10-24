import { describe, expect, it } from 'vitest';
import { filterOpenLoops, resolveOpenLoops, type OpenLoopSourceRecord } from './open-loops.js';

const now = '2026-10-23T12:00:00.000Z';
const make = (overrides: Partial<OpenLoopSourceRecord> = {}): OpenLoopSourceRecord => ({
  id: 'task-1', type: 'task', title: 'Call provider', status: 'ACTIVE',
  createdAt: '2026-10-20T12:00:00.000Z', updatedAt: '2026-10-22T12:00:00.000Z', ...overrides,
});

describe('resolveOpenLoops', () => {
  it('excludes closed records', () => {
    const result = resolveOpenLoops([make(), make({ id: 'done', status: 'COMPLETE' }), make({ id: 'cancel', status: 'CANCELLED' })], now);
    expect(result.totalOpen).toBe(1);
  });
  it('classifies overdue, exact 72-hour boundary, and missing dates', () => {
    const result = resolveOpenLoops([
      make({ id: 'late', dueAt: '2026-10-23T11:59:59.000Z' }),
      make({ id: 'edge', dueAt: '2026-10-26T12:00:00.000Z' }), make({ id: 'none' }),
    ], now);
    expect(result.overdueCount).toBe(1); expect(result.dueWithin72HoursCount).toBe(1); expect(result.noDueDateCount).toBe(1);
  });
  it('requires an explicit follow-up flag for event follow-ups', () => {
    const result = resolveOpenLoops([
      make({ id: 'no', type: 'event_follow_up', requiresFollowUp: false }),
      make({ id: 'yes', type: 'event_follow_up', requiresFollowUp: true }),
    ], now);
    expect(result.totalOpen).toBe(1);
  });
  it('deduplicates by canonical ID, not title', () => {
    const result = resolveOpenLoops([
      make({ id: 'a', canonicalId: 'task:a' }),
      make({ id: 'projection', canonicalId: 'task:a', updatedAt: '2026-10-23T10:00:00.000Z' }),
      make({ id: 'b', title: 'Call provider' }),
    ], now);
    expect(result.totalOpen).toBe(2);
    expect(result.items.find(x => x.canonicalId === 'task:a')?.id).toBe('projection');
  });
  it('filters visible items without mutating global counts', () => {
    const result = resolveOpenLoops([make({ linkedEntityIds: ['person-a'] }), make({ id: 'b', linkedEntityIds: ['person-b'] })], now);
    expect(filterOpenLoops(result, { linkedEntityId: 'person-a' })).toHaveLength(1);
    expect(result.totalOpen).toBe(2);
  });
  it('returns zero counts for empty input and deterministic tie ordering', () => {
    expect(resolveOpenLoops([], now)).toMatchObject({ totalOpen: 0, overdueCount: 0, dueWithin72HoursCount: 0, noDueDateCount: 0 });
    const result = resolveOpenLoops([make({ id: 'z' }), make({ id: 'a' })], now);
    expect(result.items.map(x => x.canonicalId)).toEqual(['task:a', 'task:z']);
  });
});
