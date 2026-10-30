import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { buildApp } from '../src/app.js';
import { openDb } from '../src/db.js';

const TOKEN = 'test-token-0123456789';
const auth = { authorization: `Bearer ${TOKEN}` };
const rec = (id: string, updatedAt: string, title = 'x') => ({ table: 'bill', id, updatedAt, data: { id, title } });

describe('api', async () => {
  const db = await openDb('mem://');
  const app = await buildApp({ db, token: TOKEN, origins: ['https://example.github.io'] });
  after(async () => { await app.close(); await db.close(); });

  it('serves /health without auth', async () => {
    assert.equal((await app.inject({ url: '/health' })).statusCode, 200);
  });
  it('rejects missing and wrong tokens', async () => {
    assert.equal((await app.inject({ url: '/api/records' })).statusCode, 401);
    assert.equal((await app.inject({ url: '/api/records', headers: { authorization: 'Bearer nope' } })).statusCode, 401);
    assert.equal((await app.inject({ url: '/api/records', headers: auth })).statusCode, 200);
  });
  it('round-trips records and applies last-write-wins', async () => {
    const put = (records: unknown[]) => app.inject({ method: 'PUT', url: '/api/records', headers: auth, payload: { records } });
    assert.deepEqual((await put([rec('b1', '2026-10-25T10:00:00.000Z', 'one')])).json(), { applied: 1, skipped: 0 });
    assert.deepEqual((await put([rec('b1', '2026-10-25T09:00:00.000Z', 'older')])).json(), { applied: 0, skipped: 1 });
    assert.deepEqual((await put([rec('b1', '2026-10-25T11:00:00.000Z', 'newer')])).json(), { applied: 1, skipped: 0 });
    const got = (await app.inject({ url: '/api/records', headers: auth })).json().records;
    assert.equal(got.length, 1);
    assert.equal(got[0].data.title, 'newer');
  });
  it('rejects bad bodies and unknown tables', async () => {
    const bad = (payload: object) => app.inject({ method: 'PUT', url: '/api/records', headers: auth, payload });
    assert.equal((await bad({ nope: 1 })).statusCode, 400);
    assert.equal((await bad({ records: [{ ...rec('z', '2026-10-25T10:00:00.000Z'), table: 'secrets' }] })).statusCode, 400);
  });
  it('answers CORS preflight only for allowed origins', async () => {
    const pre = (origin: string) => app.inject({ method: 'OPTIONS', url: '/api/records', headers: { origin, 'access-control-request-method': 'PUT' } });
    assert.equal((await pre('https://example.github.io')).headers['access-control-allow-origin'], 'https://example.github.io');
    assert.equal((await pre('https://evil.example')).headers['access-control-allow-origin'], undefined);
  });
  it('persists on disk across restarts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'lifeos-'));
    try {
      const url = `surrealkv://${dir}/db`;
      const d1 = await openDb(url);
      const a1 = await buildApp({ db: d1, token: TOKEN, origins: [] });
      await a1.inject({ method: 'PUT', url: '/api/records', headers: auth, payload: { records: [rec('keep', '2026-10-25T10:00:00.000Z', 'kept')] } });
      await a1.close(); await d1.close();
      const d2 = await openDb(url);
      const a2 = await buildApp({ db: d2, token: TOKEN, origins: [] });
      const got = (await a2.inject({ url: '/api/records', headers: auth })).json().records;
      assert.equal(got[0].data.title, 'kept');
      await a2.close(); await d2.close();
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
