import type { WorkflowState } from './index.js';

export type OpenLoopType = 'task' | 'question' | 'follow_up' | 'risk' | 'commitment' | 'event_follow_up';
export type OpenLoopPriority = 'low' | 'normal' | 'high' | 'urgent';
export type OpenLoopTiming = 'overdue' | 'next_72_hours' | 'later' | 'no_due_date';

export interface OpenLoopSourceRecord {
  id: string; type: OpenLoopType; title: string;
  status: WorkflowState | 'CANCELLED' | 'DISMISSED';
  createdAt: string; updatedAt: string; dueAt?: string | null; nextActionAt?: string | null;
  priority?: OpenLoopPriority; linkedEntityIds?: string[]; requiresFollowUp?: boolean; canonicalId?: string;
}
export interface ResolvedOpenLoop extends OpenLoopSourceRecord {
  canonicalId: string; timing: OpenLoopTiming; effectiveAt: string | null; hoursUntilDue: number | null;
}
export interface OpenLoopResolution {
  asOf: string; items: ResolvedOpenLoop[]; totalOpen: number; overdueCount: number;
  dueWithin72HoursCount: number; noDueDateCount: number;
}
export interface OpenLoopFilters { types?: OpenLoopType[]; linkedEntityId?: string; timing?: OpenLoopTiming | 'all'; }

const OPEN = new Set(['ACTIVE', 'WAITING', 'BLOCKED']);
const CLOSED = new Set(['COMPLETE', 'ARCHIVED', 'CANCELLED', 'DISMISSED']);
const HOUR = 3600000;
const PRIORITY: Record<OpenLoopPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
const parsed = (value?: string | null): number | null => {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
};

/** Pure resolver. Inject one fixed clock so all dashboard metrics agree. */
export function resolveOpenLoops(records: readonly OpenLoopSourceRecord[], now: Date | string): OpenLoopResolution {
  const nowMs = typeof now === 'string' ? Date.parse(now) : now.getTime();
  if (!Number.isFinite(nowMs)) throw new RangeError('A valid reference time is required');
  const byId = new Map<string, OpenLoopSourceRecord>();
  for (const record of records) {
    if (CLOSED.has(record.status) || !OPEN.has(record.status)) continue;
    if (record.type === 'event_follow_up' && record.requiresFollowUp !== true) continue;
    const key = record.canonicalId?.trim() || record.type + ':' + record.id;
    const previous = byId.get(key);
    if (!previous || Date.parse(record.updatedAt) > Date.parse(previous.updatedAt)) byId.set(key, record);
  }
  const items: ResolvedOpenLoop[] = [...byId.entries()].map(([canonicalId, record]) => {
    const due = parsed(record.dueAt) ?? parsed(record.nextActionAt);
    const hours = due === null ? null : (due - nowMs) / HOUR;
    const timing: OpenLoopTiming = hours === null ? 'no_due_date' : hours < 0 ? 'overdue' : hours <= 72 ? 'next_72_hours' : 'later';
    return { ...record, canonicalId, timing, effectiveAt: due === null ? null : new Date(due).toISOString(), hoursUntilDue: hours };
  });
  const timingOrder: Record<OpenLoopTiming, number> = { overdue: 0, next_72_hours: 1, no_due_date: 2, later: 3 };
  items.sort((a, b) => timingOrder[a.timing] - timingOrder[b.timing]
    || PRIORITY[a.priority ?? 'normal'] - PRIORITY[b.priority ?? 'normal']
    || (a.effectiveAt ?? '9999').localeCompare(b.effectiveAt ?? '9999')
    || a.canonicalId.localeCompare(b.canonicalId));
  return {
    asOf: new Date(nowMs).toISOString(), items, totalOpen: items.length,
    overdueCount: items.filter(x => x.timing === 'overdue').length,
    dueWithin72HoursCount: items.filter(x => x.timing === 'next_72_hours').length,
    noDueDateCount: items.filter(x => x.timing === 'no_due_date').length,
  };
}

/** Filter displayed items; dashboard-wide counts remain on OpenLoopResolution. */
export function filterOpenLoops(result: OpenLoopResolution, filters: OpenLoopFilters = {}): ResolvedOpenLoop[] {
  return result.items.filter(item => (!filters.types?.length || filters.types.includes(item.type))
    && (!filters.linkedEntityId || item.linkedEntityIds?.includes(filters.linkedEntityId))
    && (!filters.timing || filters.timing === 'all' || item.timing === filters.timing));
}
