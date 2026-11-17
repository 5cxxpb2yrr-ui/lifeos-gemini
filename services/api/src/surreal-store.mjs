import { randomUUID } from 'node:crypto';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function surrealConfig() {
  return {
    url: requiredEnv('SURREAL_URL').replace(/\/$/, ''),
    namespace: process.env.SURREAL_NAMESPACE ?? 'lifeos',
    database: process.env.SURREAL_DATABASE ?? 'main',
    username: process.env.SURREAL_USER ?? 'root',
    password: requiredEnv('SURREAL_PASS'),
  };
}

export class SurrealStore {
  constructor(config = surrealConfig()) {
    this.config = config;
  }

  async query(sql) {
    const { url, namespace, database, username, password } = this.config;
    const response = await fetch(`${url}/sql`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'text/plain',
        Accept: 'application/json',
        'Surreal-NS': namespace,
        'Surreal-DB': database,
      },
      body: sql,
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SurrealDB HTTP ${response.status}: ${body.slice(0, 500)}`);
    }
    const result = await response.json();
    const failed = Array.isArray(result) && result.find((item) => item.status === 'ERR');
    if (failed) throw new Error(failed.detail ?? failed.result ?? 'SurrealDB query failed');
    return result;
  }

  async ensureSchema() {
    await this.query([
      'DEFINE TABLE IF NOT EXISTS life_event SCHEMALESS;',
      'DEFINE INDEX IF NOT EXISTS life_event_occurred_at ON TABLE life_event FIELDS occurredAt;',
      'DEFINE INDEX IF NOT EXISTS life_event_type ON TABLE life_event FIELDS eventType;',
    ].join('\n'));
  }

  async ping() {
    await this.query('RETURN true;');
    return true;
  }

  async append(eventType, payload, occurredAt = new Date().toISOString()) {
    const eventId = `evt_${randomUUID().replaceAll('-', '')}`;
    const event = { eventId, eventType, occurredAt, payload };
    // IDs are generated here and all values are serialized as JSON literals.
    // Event records are CREATE-only: canonical history is never overwritten.
    await this.query(`CREATE life_event:${eventId} CONTENT ${JSON.stringify(event)};`);
    return event;
  }

  async readEvents() {
    const response = await this.query('SELECT * FROM life_event ORDER BY occurredAt ASC;');
    const statement = Array.isArray(response) ? response.at(-1) : null;
    return Array.isArray(statement?.result) ? statement.result : [];
  }
}
