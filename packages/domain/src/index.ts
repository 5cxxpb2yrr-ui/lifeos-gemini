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

export const EntitySchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
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


/** LifeOS v3 canonical object model: four first-class record types. */
export type LifeObjectType = 'event' | 'loop' | 'person' | 'asset';
export type LoopStatus = 'open' | 'active' | 'waiting' | 'blocked' | 'complete';
export type LoopPriority = 'low' | 'normal' | 'high' | 'urgent';
export interface LifeObject {
  id: string;
  type: LifeObjectType;
  title: string;
  createdAt: string;
  updatedAt: string;
  occurredAt?: string;
  dueAt?: string | null;
  status?: LoopStatus;
  priority?: LoopPriority;
  risk?: boolean;
  waitingOn?: string | null;
  personType?: string;
  assetType?: string;
  value?: number | null;
  notes?: string;
  streams?: string[];
  relatedIds: string[];
}
export type LifeLoadBand = 'Calm' | 'Stable' | 'Busy' | 'Stressed' | 'Critical';
export interface LifeLoadBreakdown {
  score: number;
  band: LifeLoadBand;
  openCount: number;
  agePoints: number;
  priorityPoints: number;
  riskPoints: number;
  waitingPoints: number;
  drivers: Array<{ id: string; title: string; points: number; reasons: string[] }>;
}

/**
 * Deterministic, explainable first-pass Life Load resolver.
 * Per open loop: 5 base + up to 15 age points (0.5/day, capped at 30 days)
 * + priority (0/2/5/8) + 8 risk points + 2 waiting points.
 * This is a versioned product rule, not an AI judgment.
 */
export function resolveLifeLoad(objects: LifeObject[], now = new Date()): LifeLoadBreakdown {
  const priorityWeight: Record<LoopPriority, number> = { low: 0, normal: 2, high: 5, urgent: 8 };
  const loops = objects.filter((item) => item.type === 'loop' && item.status !== 'complete');
  const drivers = loops.map((loop) => {
    const ageDays = Math.max(0, (now.getTime() - Date.parse(loop.createdAt)) / 86400000);
    const age = Math.min(15, Math.floor(ageDays * 0.5 * 10) / 10);
    const priority = priorityWeight[loop.priority ?? 'normal'];
    const risk = loop.risk ? 8 : 0;
    const waiting = loop.status === 'waiting' || Boolean(loop.waitingOn) ? 2 : 0;
    const reasons: string[] = [];
    if (age > 0) reasons.push(`Age +${age}`);
    if (priority > 0) reasons.push(`Priority +${priority}`);
    if (risk) reasons.push('Risk +8');
    if (waiting) reasons.push('Waiting +2');
    return { id: loop.id, title: loop.title, points: 5 + age + priority + risk + waiting, reasons };
  });
  const score = Math.round(drivers.reduce((sum, item) => sum + item.points, 0));
  const band: LifeLoadBand = score <= 25 ? 'Calm' : score <= 75 ? 'Stable' : score <= 125 ? 'Busy' : score <= 175 ? 'Stressed' : 'Critical';
  return {
    score, band, openCount: loops.length,
    agePoints: Math.round(drivers.reduce((sum, item) => sum + (item.reasons.find((reason) => reason.startsWith('Age +')) ? Number(item.reasons.find((reason) => reason.startsWith('Age +'))!.slice(5)) : 0), 0)),
    priorityPoints: drivers.reduce((sum, item) => sum + (item.reasons.find((reason) => reason.startsWith('Priority +')) ? Number(item.reasons.find((reason) => reason.startsWith('Priority +'))!.slice(10)) : 0), 0),
    riskPoints: drivers.filter((item) => item.reasons.includes('Risk +8')).length * 8,
    waitingPoints: drivers.filter((item) => item.reasons.includes('Waiting +2')).length * 2,
    drivers: [...drivers].sort((a, b) => b.points - a.points),
  };
}
