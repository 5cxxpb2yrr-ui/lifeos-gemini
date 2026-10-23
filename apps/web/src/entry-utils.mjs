export const STORAGE_KEY = 'lifeos-mission-control.entries.v1';

const VALID_TYPES = new Set(['task', 'question', 'follow-up', 'idea', 'event']);

export function isEntry(value) {
  return Boolean(
    value &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    VALID_TYPES.has(value.type) &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    (value.completedAt === null ||
      (typeof value.completedAt === 'string' && Number.isFinite(Date.parse(value.completedAt))))
  );
}

export function readEntries(storage, key = STORAGE_KEY) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

export function writeEntries(storage, entries, key = STORAGE_KEY) {
  try {
    storage.setItem(key, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function filterEntries(entries, query, showCompleted) {
  const normalized = query.trim().toLocaleLowerCase();
  return entries.filter((entry) => {
    const isCompleted = Boolean(entry.completedAt);
    const matchesStatus = showCompleted ? isCompleted : !isCompleted;
    const matchesQuery = !normalized ||
      entry.title.toLocaleLowerCase().includes(normalized) ||
      entry.type.includes(normalized);
    return matchesStatus && matchesQuery;
  });
}
