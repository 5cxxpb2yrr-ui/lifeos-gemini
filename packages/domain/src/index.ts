import { z } from 'zod';

export type EntityType =
  | 'person'
  | 'task'
  | 'goal'
  | 'project'
  | 'property'
  | 'vehicle'
  | 'document'
  | 'subscription'
  | 'organization'
  | 'event'
  | 'account'
  | 'debt'
  | 'asset';

export type WorkflowState = 'ACTIVE' | 'WAITING' | 'BLOCKED' | 'COMPLETE' | 'ARCHIVED';
export type SignalState = 'DETECTED' | 'ACTIVE' | 'SUPPRESSED' | 'RESOLVED' | 'EXPIRED';
export type RecommendationCategory =
  | 'execute_now'
  | 'decision_required'
  | 'risk'
  | 'waiting'
  | 'opportunity'
  | 'relationship'
  | 'review';

export const EntitySchema = /* @__PURE__ */ z.object({
  id: /* @__PURE__ */ z.string(),
  type: /* @__PURE__ */ z.string(),
  title: /* @__PURE__ */ z.string(),
  status: /* @__PURE__ */ z.string(),
  createdAt: /* @__PURE__ */ z.date(),
  updatedAt: /* @__PURE__ */ z.date(),
});

export interface Recommendation {
  id: string;
  entityId: string;
  title: string;
  category: RecommendationCategory;
  recommendation: string;
  whyThisMatters: string;
  expectedOutcome: string;
  impactScore: number;
  confidenceScore: number;
  urgencyScore: number;
  actions: string[];
}

export type OpenLoopType = 'task' | 'question' | 'follow_up' | 'risk' | 'commitment' | 'event_follow_up';
export type OpenLoopTiming = 'overdue' | 'next_72_hours' | 'later' | 'no_due_date';
export interface OpenLoopSourceRecord {
  id: string;
  type: OpenLoopType;
  title: string;
  status: WorkflowState;
  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  nextActionAt?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  linkedEntityIds?: string[];
  requiresFollowUp?: boolean;
}
export interface ResolvedOpenLoop extends OpenLoopSourceRecord {
  canonicalId: string;
  timing: OpenLoopTiming;
  effectiveAt: string | null;
}
export interface OpenLoopsResolution {
  items: ResolvedOpenLoop[];
  totalOpen: number;
  overdueCount: number;
  dueWithin72HoursCount: number;
  noDueDateCount: number;
}

/** Owns effective-date selection, timing classification, and open-loop counts. */
export function resolveOpenLoops(records: OpenLoopSourceRecord[], now = new Date()): OpenLoopsResolution {
  const active = records.filter((record) => !['COMPLETE', 'ARCHIVED'].includes(record.status));
  const items = active.map((record): ResolvedOpenLoop => {
    const effectiveAt = record.nextActionAt ?? record.dueAt ?? null;
    const timestamp = effectiveAt ? new Date(effectiveAt).getTime() : Number.NaN;
    const timing: OpenLoopTiming = !Number.isFinite(timestamp)
      ? 'no_due_date'
      : timestamp < now.getTime()
        ? 'overdue'
        : timestamp <= now.getTime() + 72 * 60 * 60 * 1000
          ? 'next_72_hours'
          : 'later';
    return { ...record, canonicalId: record.id, effectiveAt, timing };
  });
  return {
    items,
    totalOpen: items.length,
    overdueCount: items.filter((item) => item.timing === 'overdue').length,
    dueWithin72HoursCount: items.filter((item) => item.timing === 'next_72_hours').length,
    noDueDateCount: items.filter((item) => item.timing === 'no_due_date').length,
  };
}

/** Applies display filters without reimplementing resolver timing rules. */
export function filterOpenLoops(
  items: ResolvedOpenLoop[] | OpenLoopsResolution,
  options: { timing?: OpenLoopTiming | 'all' },
): ResolvedOpenLoop[] {
  const resolvedItems = Array.isArray(items) ? items : items.items;
  return options.timing && options.timing !== 'all'
    ? resolvedItems.filter((item) => item.timing === options.timing)
    : resolvedItems;
}
