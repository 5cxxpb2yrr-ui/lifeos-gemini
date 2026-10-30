export type BackupLoop = {
  id: string;
  title: string;
  type: string;
  status: 'open' | 'completed';
  dueAt: string | null;
};
export type BackupEvent = {
  id: string;
  title: string;
  date: string | null;
};
export type LifeOSBackupSummary = {
  format: string | null;
  schemaVersion: string | null;
  sectionCounts: Record<string, number>;
  totalRecords: number;
  openLoops: BackupLoop[];
  completedLoops: BackupLoop[];
  events: BackupEvent[];
  financialSections: string[];
};
export function parseLifeOSBackup(input: unknown): LifeOSBackupSummary;
export function readLifeOSBackupFile(file: Pick<File, 'text'>): Promise<LifeOSBackupSummary>;
