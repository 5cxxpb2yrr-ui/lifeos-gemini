import test from 'node:test';
import assert from 'node:assert/strict';
import { filterOpenLoops, resolveOpenLoops } from '../dist/open-loops.js';

const now = '2026-10-23T12:00:00.000Z';
const make = (overrides = {}) => ({ id: 'task-1', type: 'task', title: 'Call provider', status: 'ACTIVE', createdAt: '2026-10-20T12:00:00.000Z', updatedAt: '2026-10-22T12:00:00.000Z', ...overrides });

test('excludes closed records', () => {
  const result = resolveOpenLoops([make(), make({ id: 'done', status: 'COMPLETE' }), make({ id: 'cancel', status: 'CANCELLED' })], now);
  assert.equal(result.totalOpen, 1);
});
test('classifies overdue, exact 72-hour boundary, and missing dates', () => {
  const result = resolveOpenLoops([make({ id: 'late', dueAt: '2026-10-23T11:59:59.000Z' }), make({ id: 'edge', dueAt: '2026-10-26T12:00:00.000Z' }), make({ id: 'none' })], now);
  assert.equal(result.overdueCount, 1); assert.equal(result.dueWithin72HoursCount, 1); assert.equal(result.noDueDateCount, 1);
});
test('requires an explicit follow-up flag for event follow-ups', () => {
  const result = resolveOpenLoops([make({ id: 'no', type: 'event_follow_up', requiresFollowUp: false }), make({ id: 'yes', type: 'event_follow_up', requiresFollowUp: true })], now);
  assert.equal(result.totalOpen, 1);
});
test('deduplicates by canonical ID but not by title', () => {
  const result = resolveOpenLoops([make({ id: 'a', canonicalId: 'task:a' }), make({ id: 'projection', canonicalId: 'task:a', updatedAt: '2026-10-23T10:00:00.000Z' }), make({ id: 'b', title: 'Call provider' })], now);
  assert.equal(result.totalOpen, 2); assert.equal(result.items.find(x => x.canonicalId === 'task:a').id, 'projection');
});
test('filters visible items without changing global counts', () => {
  const result = resolveOpenLoops([make({ linkedEntityIds: ['person-a'] }), make({ id: 'b', linkedEntityIds: ['person-b'] })], now);
  assert.equal(filterOpenLoops(result, { linkedEntityId: 'person-a' }).length, 1); assert.equal(result.totalOpen, 2);
});
test('empty input and tie ordering are deterministic', () => {
  assert.deepEqual(resolveOpenLoops([], now), { asOf: now, items: [], totalOpen: 0, overdueCount: 0, dueWithin72HoursCount: 0, noDueDateCount: 0 });
  const result = resolveOpenLoops([make({ id: 'z' }), make({ id: 'a' })], now);
  assert.deepEqual(result.items.map(x => x.canonicalId), ['task:a', 'task:z']);
});
test('rejects invalid reference time', () => assert.throws(() => resolveOpenLoops([], 'not-a-date'), RangeError));
