import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEntries, STORAGE_KEY } from '../src/entry-utils.mjs';

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

const entry = {
  id: 'entry-1',
  title: 'Call the utility company',
  type: 'task',
  createdAt: '2026-10-23T09:00:00.000Z',
  completedAt: null,
};

test('loadEntries returns healthy entries', () => {
  const storage = makeStorage({ [STORAGE_KEY]: JSON.stringify([entry]) });
  const result = loadEntries(storage, STORAGE_KEY, '2026-10-23T09:05:00.000Z');

  assert.deepEqual(result.entries, [entry]);
  assert.equal(result.status, 'ok');
  assert.equal(result.backupKey, null);
  assert.equal(result.dropped, 0);
});

test('loadEntries treats empty storage as empty', () => {
  const storage = makeStorage({ [STORAGE_KEY]: '' });
  const result = loadEntries(storage, STORAGE_KEY, '2026-10-23T09:05:00.000Z');

  assert.deepEqual(result.entries, []);
  assert.equal(result.status, 'empty');
  assert.equal(result.backupKey, null);
  assert.equal(result.dropped, 0);
});

test('loadEntries recovers corrupt JSON', () => {
  const storage = makeStorage({ [STORAGE_KEY]: '{bad json' });
  const result = loadEntries(storage, STORAGE_KEY, '2026-10-23T09:05:00.000Z');

  assert.deepEqual(result.entries, []);
  assert.equal(result.status, 'corrupt');
  assert.ok(result.backupKey && result.backupKey.startsWith(`${STORAGE_KEY}.recovered-`));
  assert.equal(storage.getItem(result.backupKey), '{bad json');
});

test('loadEntries keeps valid entries when some records are invalid', () => {
  const storage = makeStorage({
    [STORAGE_KEY]: JSON.stringify([
      entry,
      { ...entry, id: 'bad-entry', title: '', type: 'task', createdAt: 'bad-date' },
    ]),
  });

  const result = loadEntries(storage, STORAGE_KEY, '2026-10-23T09:05:00.000Z');

  assert.deepEqual(result.entries, [entry]);
  assert.equal(result.status, 'partial');
  assert.equal(result.dropped, 1);
  assert.ok(result.backupKey && result.backupKey.startsWith(`${STORAGE_KEY}.recovered-`));
  assert.match(storage.getItem(result.backupKey), /\[\{\s*"id":\s*"entry-1"/);
});

test('loadEntries marks storage as unavailable when reading fails', () => {
  const storage = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  };

  const result = loadEntries(storage, STORAGE_KEY, '2026-10-23T09:05:00.000Z');

  assert.deepEqual(result.entries, []);
  assert.equal(result.status, 'unavailable');
  assert.equal(result.backupKey, null);
});

test('loadEntries reports unavailable when recovery write fails under full storage', () => {
  const storage = {
    getItem(key) {
      if (key === STORAGE_KEY) {
        return JSON.stringify([{ ...entry, title: '' }]);
      }
      return null;
    },
    setItem(key) {
      if (key.startsWith(`${STORAGE_KEY}.recovered-`)) {
        throw new Error('quota exceeded');
      }
    },
  };

  const result = loadEntries(storage, STORAGE_KEY, '2026-10-23T09:05:00.000Z');

  assert.deepEqual(result.entries, []);
  assert.equal(result.status, 'unavailable');
  assert.equal(result.backupKey, null);
});
