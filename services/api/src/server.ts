import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { openDb } from './db.js';

const cfg = loadConfig();
if (cfg.token.length < 16) {
  console.error('API_TOKEN is required and must be at least 16 characters.');
  process.exit(1);
}
const db = await openDb(cfg.surrealUrl);
const app = await buildApp({ db, token: cfg.token, origins: cfg.origins });
await app.listen({ port: cfg.port, host: cfg.host });
console.log(`LifeOS API listening on ${cfg.host}:${cfg.port}`);
for (const sig of ['SIGINT', 'SIGTERM'] as const) process.on(sig, async () => { await app.close(); await db.close(); process.exit(0); });
