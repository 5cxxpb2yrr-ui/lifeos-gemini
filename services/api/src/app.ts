import { createNodeEngines } from '@surrealdb/node';
import { RecordId, Surreal, Table } from 'surrealdb';

export const TABLES = ['bill', 'decision', 'loop', 'person', 'insight', 'project', 'goal', 'kv'] as const;
export type TableName = (typeof TABLES)[number];
export interface Rec { table: TableName; id: string; updatedAt: string; data: Record<string, unknown> }
interface Row { id: RecordId; updatedAt: string; data: Record<string, unknown> }

export async function openDb(url: string, namespace = 'lifeos', database = 'main'): Promise<Surreal> {
  const db = new Surreal({ engines: createNodeEngines() });
  await db.connect(url);
  await db.use({ namespace, database });
  return db;
}

export async function listRecords(db: Surreal): Promise<Rec[]> {
  const out: Rec[] = [];
  for (const table of TABLES) {
    const rows = (await db.select(new Table(table))) as unknown as Row[];
    for (const r of rows) out.push({ table, id: String(r.id.id), updatedAt: r.updatedAt, data: r.data });
  }
  return out;
}

export async function upsertRecords(db: Surreal, recs: Rec[]): Promise<{ applied: number; skipped: number }> {
  let applied = 0, skipped = 0;
  for (const r of recs) {
    const rid = new RecordId(r.table, r.id);
    const cur = (await db.select(rid)) as unknown as Row | undefined;
    if (cur && cur.updatedAt >= r.updatedAt) { skipped++; continue; }
    await db.upsert(rid).content({ updatedAt: r.updatedAt, data: r.data });
    applied++;
  }
  return { applied, skipped };
}
