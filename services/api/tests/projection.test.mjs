import test from 'node:test';
import assert from 'node:assert/strict';
import { projectLifeState } from '../src/projection.mjs';

const at = (minute) => new Date(Date.UTC(2026, 0, 1, 0, minute)).toISOString();

test('rebuilds canonical objects from immutable creation and update events', () => {
  const state = projectLifeState([
    { eventId: '2', eventType: 'object.updated', occurredAt: at(2), payload: { objectId: 'loop-1', patch: { priority: 'urgent' } } },
    { eventId: '1', eventType: 'object.created', occurredAt: at(1), payload: { object: { id: 'loop-1', type: 'loop', title: 'Renew registration', status: 'open', priority: 'normal', relatedIds: [] } } },
  ]);
  assert.equal(state.objects[0].priority, 'urgent');
  assert.equal(state.objects[0].title, 'Renew registration');
  assert.equal(state.eventCount, 2);
});

test('relationships are symmetric and idempotent', () => {
  const state = projectLifeState([
    { eventId: '1', eventType: 'object.created', occurredAt: at(1), payload: { object: { id: 'p1', type: 'person', title: 'Person', relatedIds: [] } } },
    { eventId: '2', eventType: 'object.created', occurredAt: at(2), payload: { object: { id: 'a1', type: 'asset', title: 'Vehicle', relatedIds: [] } } },
    { eventId: '3', eventType: 'object.related', occurredAt: at(3), payload: { sourceId: 'p1', targetId: 'a1' } },
    { eventId: '4', eventType: 'object.related', occurredAt: at(4), payload: { sourceId: 'p1', targetId: 'a1' } },
  ]);
  assert.deepEqual(state.objects.find((x) => x.id === 'p1').relatedIds, ['a1']);
  assert.deepEqual(state.objects.find((x) => x.id === 'a1').relatedIds, ['p1']);
});

test('loop completion creates a historical event and preserves the loop', () => {
  const state = projectLifeState([
    { eventId: '1', eventType: 'object.created', occurredAt: at(1), payload: { object: { id: 'l1', type: 'loop', title: 'Change oil', status: 'open', relatedIds: [] } } },
    { eventId: '2', eventType: 'loop.completed', occurredAt: at(2), payload: { loopId: 'l1', completionEventId: 'e1', title: 'Oil changed' } },
  ]);
  assert.equal(state.objects.find((x) => x.id === 'l1').status, 'complete');
  assert.equal(state.objects.find((x) => x.id === 'e1').type, 'event');
  assert.deepEqual(state.objects.find((x) => x.id === 'l1').relatedIds, ['e1']);
});

test('unknown events stay harmless and remain counted', () => {
  const state = projectLifeState([{ eventId: '1', eventType: 'future.signal', occurredAt: at(1), payload: {} }]);
  assert.equal(state.objects.length, 0);
  assert.equal(state.eventCount, 1);
});
