/**
 * Local-only parser for LifeOS JSON backups.
 *
 * This module never uploads data or writes to browser storage. Callers decide
 * what to display and when to persist. Unknown sections are preserved as
 * counts/metadata only; this deliberately does not aggregate financial values.
 */
const OPEN_LOOP_SECTIONS = ['openLoops', 'open_loops', 'loops', 'tasks', 'questions', 'followUps', 'follow_ups', 'risks', 'commitments'];
const EVENT_SECTIONS = ['events'];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function firstString(record, keys) {
  for (const key of keys) {
    if (typeof record[key] === 'string' && record[key].trim()) return record[key].trim();
  }
  return '';
}

function normalizeLoop(record, section, index) {
  if (!isRecord(record)) return null;
  const title = firstString(record, ['title', 'name', 'text', 'description', 'question']);
  if (!title) return null;
  const rawStatus = firstString(record, ['status', 'state']).toLowerCase();
  const completed = Boolean(record.completedAt || record.completed_at || record.resolvedAt || record.resolved_at) ||
    ['complete', 'completed', 'done', 'resolved', 'closed', 'cancelled', 'canceled'].includes(rawStatus);
  const dueAt = firstString(record, ['dueAt', 'due_at', 'dueDate', 'due_date', 'nextActionAt', 'next_action_at']) || null;
  const validDueAt = dueAt && Number.isFinite(Date.parse(dueAt)) ? new Date(dueAt).toISOString() : null;
  return {
    id: firstString(record, ['id', 'uuid', 'key']) || `backup-${section}-${index}`,
    title,
    type: section,
    status: completed ? 'completed' : 'open',
    dueAt: validDueAt,
  };
}

export function parseLifeOSBackup(input) {
  let data;
  try {
    data = typeof input === 'string' ? JSON.parse(input) : input;
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!isRecord(data)) throw new Error('Expected a LifeOS backup JSON object.');

  // Support common export envelopes without assuming any one schema version.
  const root = isRecord(data.data) ? data.data : isRecord(data.records) ? data.records : data;
  const sections = Object.entries(root).filter(([, value]) => Array.isArray(value));
  if (sections.length === 0) throw new Error('No record collections were found in this JSON file.');

  const loops = [];
  const sectionCounts = {};
  for (const [section, records] of sections) {
    sectionCounts[section] = records.length;
    if (OPEN_LOOP_SECTIONS.includes(section)) {
      records.forEach((record, index) => {
        const normalized = normalizeLoop(record, section, index);
        if (normalized) loops.push(normalized);
      });
    }
  }

  const events = Array.isArray(root.events)
    ? root.events.filter(isRecord).map((record, index) => ({
        id: firstString(record, ['id', 'uuid', 'key']) || `backup-events-${index}`,
        title: firstString(record, ['title', 'name', 'description', 'type']) || 'Untitled event',
        date: firstString(record, ['startAt', 'start_at', 'date', 'startDate', 'start_date']) || null,
      }))
    : [];

  return {
    format: firstString(data, ['format', 'formatVersion', '_format']) || null,
    schemaVersion: firstString(data, ['schemaVersion', 'schema_version']) || null,
    sectionCounts,
    totalRecords: Object.values(sectionCounts).reduce((sum, count) => sum + count, 0),
    openLoops: loops.filter((item) => item.status === 'open'),
    completedLoops: loops.filter((item) => item.status === 'completed'),
    events,
    // Financial sections are counted only; balances are intentionally not summed.
    financialSections: Object.keys(sectionCounts).filter((key) => /account|asset|cash|balance|bill|transaction|loan|investment/i.test(key)),
  };
}

export async function readLifeOSBackupFile(file) {
  if (!file || typeof file.text !== 'function') throw new Error('Choose a JSON backup file first.');
  const text = await file.text();
  if (text.length > 15 * 1024 * 1024) throw new Error('Backup is larger than the 15 MB local import limit.');
  return parseLifeOSBackup(text);
}
