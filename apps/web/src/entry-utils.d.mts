export type EntryType = 'task' | 'question' | 'follow-up' | 'idea' | 'event';
export type StoredEntry = {
  id: string;
  title: string;
  type: EntryType;
  createdAt: string;
  completedAt: string | null;
};
export const STORAGE_KEY: string;
export function isEntry(value: unknown): value is StoredEntry;
export function readEntries(storage: Pick<Storage, 'getItem'>, key?: string): StoredEntry[];
export function writeEntries(storage: Pick<Storage, 'setItem'>, entries: StoredEntry[], key?: string): boolean;
export function filterEntries(entries: StoredEntry[], query: string, showCompleted: boolean): StoredEntry[];
