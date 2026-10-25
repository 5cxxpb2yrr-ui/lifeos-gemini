import cors from '@fastify/cors';
import Fastify from 'fastify';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Surreal } from 'surrealdb';
import { z } from 'zod';
import { listRecords, TABLES, upsertRecords } from './db.js';

const Body = z.object({
  records: z.array(z.object({
    table: z.enum(TABLES), id: z.string().min(1).max(200), updatedAt: z.string().min(10).max(40), data: z.record(z.unknown()),
  })).max(2000),
});

const sha = (s: string) => createHash('sha256').update(s).digest();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function buildApp(o: { db: Surreal; token: string; origins: string[] }) {
  const app = Fastify({ bodyLimit: 5 * 1024 * 1024, logger: false });
  await app.register(cors, { origin: o.origins.length ? o.origins : false, methods: ['GET', 'PUT', 'OPTIONS'], allowedHeaders: ['authorization', 'content-type'] });
  const want = sha(o.token);

  app.addHook('onRequest', async (req, reply) => {
    if (!req.url.startsWith('/api/') || req.method === 'OPTIONS') return;
    const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? '');
    if (!m || !timingSafeEqual(sha(m[1]), want)) { await sleep(250); return reply.code(401).send({ error: 'unauthorized' }); }
  });

  app.get('/health', async () => ({ ok: true }));
  app.get('/api/records', async () => ({ records: await listRecords(o.db) }));
  app.put('/api/records', async (req, reply) => {
    const p = Body.safeParse(req.body);
    if (!p.success) return reply.code(400).send({ error: 'invalid body', issues: p.error.issues.slice(0, 5) });
    return upsertRecords(o.db, p.data.records);
  });

  return app;
}
