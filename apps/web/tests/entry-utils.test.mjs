import test from 'node:test';
import assert from 'node:assert/strict';
import { filterEntries, isEntry, readEntries, writeEntries, STORAGE_KEY } from '../src/entry-utils.mjs';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    data,
  };
}

const openTask = { id: '1', title: 'Call the utility company', type: 'task', createdAt: '2026-10-23T12:00:00.000Z', completedAt: null };
const closedTask = { ...openTask, id: '2', title: 'Review the budget', completedAt: '2026-10-23T13:00:00.000Z' };

test('capture data survives a write/read round trip', () => {
  const storage = memoryStorage();
  assert.equal(writeEntries(storage, [openTask]), true);
  assert.deepEqual(readEntries(storage), [openTask]);
  assert.ok(storage.getItem(STORAGE_KEY));
});

test('malformed storage and invalid records safely produce an empty or filtered list', () => {
  assert.deepEqual(readEntries(memoryStorage({ [STORAGE_KEY]: '{broken' })), []);
  const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify([openTask, { ...openTask, type: 'unknown' }, { ...openTask, createdAt: 'not-a-date' }]) });
  assert.deepEqual(readEntries(storage), [openTask]);
  assert.equal(isEntry({ ...openTask, title: '   ' }), false);
});

test('search matches title and type and filters open versus completed entries', () => {
  assert.deepEqual(filterEntries([openTask, closedTask], 'utility', false), [openTask]);
  assert.deepEqual(filterEntries([openTask, closedTask], 'budget', true), [closedTask]);
  assert.deepEqual(filterEntries([openTask, closedTask], 'task', false), [openTask]);
  assert.deepEqual(filterEntries([openTask, closedTask], 'missing', false), []);
});

test('storage write failures do not crash the app', () => {
  const unavailable = { setItem() { throw new Error('quota exceeded'); }, getItem() { throw new Error('blocked'); } };
  assert.equal(writeEntries(unavailable, [openTask]), false);
  assert.deepEqual(readEntries(unavailable), []);
});
