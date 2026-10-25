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

export interface Project {
  id: string;
  title: string;
  category?: string;
  status?: string;
  progress?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  level?: string;
  progress?: number;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkRecord {
  id: string;
  sourceType: 'bill' | 'decision' | 'person' | 'loop' | 'insight' | 'project' | 'goal';
  sourceId: string;
  targetType: 'project' | 'goal';
  targetId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const EntitySchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
