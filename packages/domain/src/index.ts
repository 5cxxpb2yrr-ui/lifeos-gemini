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
