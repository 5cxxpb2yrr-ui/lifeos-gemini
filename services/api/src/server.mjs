import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { projectLifeState } from './projection.mjs';
import { SurrealStore } from './surreal-store.mjs';

const port = Number(process.env.PORT ?? 8787);
const apiToken = process.env.LIFEOS_API_TOKEN;
if (!apiToken) throw new Error('LIFEOS_API_TOKEN must be configured before the API can start.');

const store = new SurrealStore();
const allowedTypes = new Set(['event', 'loop', 'person', 'asset']);
const allowedLoopStatuses = new Set(['open', 'active', 'waiting', 'blocked', 'complete']);
const allowedPriorities = new Set(['low', 'normal', 'high', 'urgent']);

function send(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1_000_000) throw Object.assign(new Error('Request body too large'), { status: 413 });
  }
  try { return raw ? JSON.parse(raw) : {}; }
  catch { throw Object.assign(new Error('Request body must be valid JSON'), { status: 400 }); }
}

function validateObject(input) {
  if (!input || !allowedTypes.has(input.type)) throw Object.assign(new Error('type must be event, loop, person, or asset'), { status: 400 });
  if (typeof input.title !== 'string' || !input.title.trim()) throw Object.assign(new Error('title is required'), { status: 400 });
  const id = input.id ?? `obj_${randomUUID().replaceAll('-', '')}`;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw Object.assign(new Error('id contains unsupported characters'), { status: 400 });
  const now = new Date().toISOString();
  const object = {
    ...input,
    id,
    title: input.title.trim(),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    relatedIds: Array.isArray(input.relatedIds) ? [...new Set(input.relatedIds)] : [],
    areas: Array.isArray(input.areas) ? [...new Set(input.areas.filter((area) => typeof area === 'string' && area.trim()).map((area) => area.trim()))] : [],
  };
  if (object.type === 'loop') {
    object.status ??= 'open';
    object.priority ??= 'normal';
    if (!allowedLoopStatuses.has(object.status)) throw Object.assign(new Error('Invalid loop status'), { status: 400 });
    if (!allowedPriorities.has(object.priority)) throw Object.assign(new Error('Invalid loop priority'), { status: 400 });
  }
  return object;
}

async function route(request, response) {
  const url = new URL(request.url, 'http://localhost');
  if (request.method === 'GET' && url.pathname === '/health') {
    try { await store.ping(); return send(response, 200, { status: 'ok', database: 'connected' }); }
    catch (error) { return send(response, 503, { status: 'degraded', database: 'unavailable', error: error.message }); }
  }

  if (request.headers.authorization !== `Bearer ${apiToken}`) {
    return send(response, 401, { error: 'Unauthorized' });
  }

  if (request.method === 'GET' && url.pathname === '/v1/state') {
    const events = await store.readEvents();
    return send(response, 200, { ...projectLifeState(events), generatedAt: new Date().toISOString() });
  }

  if (request.method === 'GET' && url.pathname === '/v1/timeline') {
    const events = await store.readEvents();
    return send(response, 200, { events: [...events].reverse() });
  }

  if (request.method === 'POST' && url.pathname === '/v1/objects') {
    const object = validateObject(await readJson(request));
    const event = await store.append('object.created', { object });
    return send(response, 201, { object, event });
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/v1/objects/')) {
    const objectId = decodeURIComponent(url.pathname.slice('/v1/objects/'.length));
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(objectId)) return send(response, 400, { error: 'Invalid object id' });
    const patch = await readJson(request);
    const forbidden = ['id', 'type', 'createdAt', 'relatedIds'];
    if (forbidden.some((key) => key in patch)) return send(response, 400, { error: 'Identity and relationship fields cannot be changed through object update.' });
    const state = projectLifeState(await store.readEvents());
    const current = state.objects.find((item) => item.id === objectId);
    if (!current) return send(response, 404, { error: 'Object not found' });
    const allowed = current.type === 'loop'
      ? ['title', 'notes', 'status', 'priority', 'dueAt', 'waitingOn', 'risk', 'areas']
      : ['title', 'notes', 'value', 'areas', 'personType', 'assetType', 'occurredAt'];
    const cleanPatch = Object.fromEntries(Object.entries(patch).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(cleanPatch).length) return send(response, 400, { error: 'No supported fields to update' });
    if (cleanPatch.status && !allowedLoopStatuses.has(cleanPatch.status)) return send(response, 400, { error: 'Invalid loop status' });
    if (cleanPatch.priority && !allowedPriorities.has(cleanPatch.priority)) return send(response, 400, { error: 'Invalid loop priority' });
    const event = await store.append('object.updated', { objectId, patch: cleanPatch });
    return send(response, 200, { event });
  }

  const completeMatch = url.pathname.match(/^\/v1\/loops\/([^/]+)\/complete$/);
  if (request.method === 'POST' && completeMatch) {
    const loopId = decodeURIComponent(completeMatch[1]);
    const state = projectLifeState(await store.readEvents());
    const loop = state.objects.find((item) => item.id === loopId && item.type === 'loop');
    if (!loop) return send(response, 404, { error: 'Open Loop not found' });
    if (loop.status === 'complete') return send(response, 409, { error: 'Open Loop is already complete' });
    const body = await readJson(request);
    const event = await store.append('loop.completed', {
      loopId,
      completionEventId: `obj_${randomUUID().replaceAll('-', '')}`,
      title: body.title ?? `Completed: ${loop.title}`,
      notes: body.notes ?? '',
    });
    return send(response, 201, { event });
  }

  const relationMatch = url.pathname.match(/^\/v1\/objects\/([^/]+)\/relations$/);
  if (request.method === 'POST' && relationMatch) {
    const sourceId = decodeURIComponent(relationMatch[1]);
    const { targetId } = await readJson(request);
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(sourceId) || !/^[A-Za-z0-9_-]{1,80}$/.test(targetId ?? '') || sourceId === targetId) {
      return send(response, 400, { error: 'A valid, different targetId is required' });
    }
    const objects = projectLifeState(await store.readEvents()).objects;
    if (!objects.some((item) => item.id === sourceId) || !objects.some((item) => item.id === targetId)) {
      return send(response, 404, { error: 'Both related objects must exist' });
    }
    const event = await store.append('object.related', { sourceId, targetId });
    return send(response, 201, { event });
  }

  if (request.method === 'POST' && url.pathname === '/v1/capture') {
    const { text: captureText, source = 'manual' } = await readJson(request);
    if (typeof captureText !== 'string' || !captureText.trim()) return send(response, 400, { error: 'Capture text is required' });
    const event = await store.append('capture.received', { text: captureText.trim(), source });
    return send(response, 202, { accepted: true, event });
  }

  return send(response, 404, { error: 'Route not found' });
}

const server = createServer(async (request, response) => {
  try { await route(request, response); }
  catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 500;
    send(response, status, { error: status === 500 ? 'Internal server error' : error.message, detail: status === 500 ? undefined : error.message });
    if (status === 500) console.error(error);
  }
});

async function bootstrap() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await store.ensureSchema();
      server.listen(port, '0.0.0.0', () => console.log(`LifeOS API listening on :${port}`));
      return;
    } catch (error) {
      lastError = error;
      console.log(`Waiting for SurrealDB (${attempt}/30): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}

bootstrap().catch((error) => {
  console.error('LifeOS API could not initialize its database schema:', error);
  process.exitCode = 1;
});
