export type EntryType = 'task' | 'question' | 'follow-up' | 'idea' | 'event';
export type StoredEntry = {
  id: string;
  title: string;
  type: EntryType;
  createdAt: string;
  completedAt: string | null;
};
export type EntryStatus = 'empty' | 'ok' | 'partial' | 'corrupt' | 'unavailable';
export type LoadEntriesResult = {
  entries: StoredEntry[];
  status: EntryStatus;
  backupKey: string | null;
  dropped: number;
};
export const STORAGE_KEY: string;
export function isEntry(value: unknown): value is StoredEntry;
export function loadEntries(storage: Pick<Storage, 'getItem' | 'setItem'>, key?: string, now?: Date | number | string): LoadEntriesResult;
export function readEntries(storage: Pick<Storage, 'getItem'>, key?: string): StoredEntry[];
export function writeEntries(storage: Pick<Storage, 'setItem'>, entries: StoredEntry[], key?: string): boolean;
export function filterEntries(entries: StoredEntry[], query: string, showCompleted: boolean): StoredEntry[];
