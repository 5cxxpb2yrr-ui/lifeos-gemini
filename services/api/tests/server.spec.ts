import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Surreal } from 'surrealdb';
import { buildApp } from '../src/server.js';

test('health endpoint returns ok', async () => {
  const app = await buildApp({ db: {} as Surreal, token: 'local-test-value', origins: [] });
  try {
    const response = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { ok: true });
  } finally {
    await app.close();
  }
});
