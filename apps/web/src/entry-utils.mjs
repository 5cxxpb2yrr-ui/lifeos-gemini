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

export function loadEntries(storage, key = STORAGE_KEY, now = new Date()) {
  const recoveredKey = `${key}.recovered-${new Date(now).toISOString()}`;

  try {
    const raw = storage.getItem(key);
    if (raw === null || raw.trim() === '') {
      return { entries: [], status: 'empty', backupKey: null, dropped: 0 };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      try {
        storage.setItem(recoveredKey, raw);
      } catch {
        return { entries: [], status: 'unavailable', backupKey: null, dropped: 0 };
      }
      return { entries: [], status: 'corrupt', backupKey: recoveredKey, dropped: 0 };
    }

    if (!Array.isArray(parsed)) {
      try {
        storage.setItem(recoveredKey, raw);
      } catch {
        return { entries: [], status: 'unavailable', backupKey: null, dropped: 0 };
      }
      return { entries: [], status: 'corrupt', backupKey: recoveredKey, dropped: 0 };
    }

    const entries = parsed.filter(isEntry);
    const dropped = parsed.length - entries.length;
    if (dropped > 0) {
      try {
        storage.setItem(recoveredKey, raw);
      } catch {
        return { entries: [], status: 'unavailable', backupKey: null, dropped: 0 };
      }
      return { entries, status: 'partial', backupKey: recoveredKey, dropped };
    }

    return {
      entries,
      status: entries.length === 0 ? 'empty' : 'ok',
      backupKey: null,
      dropped: 0,
    };
  } catch {
    return { entries: [], status: 'unavailable', backupKey: null, dropped: 0 };
  }
}

export function readEntries(storage, key = STORAGE_KEY) {
  return loadEntries(storage, key).entries;
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
