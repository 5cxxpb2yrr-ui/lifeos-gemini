import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLifeOSBackup } from '../src/backup-utils.mjs';

test('parses record counts and open loops without summing financial values', () => {
  const result = parseLifeOSBackup({
    format: 'v1',
    schemaVersion: 'v1',
    events: [{ id: 'e1', title: 'Morning run', date: '2026-10-25' }],
    openLoops: [{ id: 'l1', title: 'Call dentist', status: 'ACTIVE', dueAt: '2026-10-20' }],
    bills: [{ title: 'Electric', amount: 100 }],
    accounts: [{ name: 'Checking', balance: 500 }],
  });
  assert.equal(result.totalRecords, 4);
  assert.equal(result.openLoops.length, 1);
  assert.equal(result.events[0].title, 'Morning run');
  assert.deepEqual(result.financialSections.sort(), ['accounts', 'bills']);
  assert.equal(Object.hasOwn(result, 'totalBalance'), false);
});

test('rejects invalid JSON and non-object data', () => {
  assert.throws(() => parseLifeOSBackup('{bad json'), /not valid JSON/);
  assert.throws(() => parseLifeOSBackup([]), /JSON object/);
});

test('ignores malformed records and recognizes completed loops', () => {
  const result = parseLifeOSBackup({
    openLoops: [
      { id: 'a', title: 'Done item', status: 'resolved' },
      { id: 'b', title: 'No date item', status: 'ACTIVE', dueAt: 'not-a-date' },
      { id: 'c', status: 'ACTIVE' },
    ],
  });
  assert.equal(result.completedLoops.length, 1);
  assert.equal(result.openLoops.length, 1);
  assert.equal(result.openLoops[0].dueAt, null);
});
