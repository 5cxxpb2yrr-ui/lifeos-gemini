import type { Option } from './lib/scoring';

export type Variant = 'default' | 'decision' | 'risk' | 'opportunity' | 'relationship';
export type Kind = 'execute' | 'decision' | 'risk' | 'waiting' | 'relationship';
export type LinkTargetType = 'project' | 'goal';
export type LinkSourceType = 'bill' | 'decision' | 'person' | 'loop' | 'insight' | 'project' | 'goal';
export interface Ref { type: 'bill' | 'decision' | 'person' | 'loop' | 'insight' | 'project' | 'goal'; id: string }

export interface Rec {
  id: string; entity: string; title: string; context?: string; recommendation?: string;
  outcome?: string; why?: string; impact: number; confidence: number; actions: string[];
  kind?: Kind; ref?: Ref; hot?: boolean; factors?: [string, number][];
  projectId?: string; goalId?: string;
}

export interface Project {
  id: string; title: string; category?: string; status?: string; progress?: number; description?: string;
  createdAt?: string; updatedAt?: string;
}
export interface Goal {
  id: string; title: string; level?: string; progress?: number; status?: string; dueDate?: string;
  createdAt?: string; updatedAt?: string;
}
export interface LinkRecord {
  id: string; sourceType: LinkSourceType; sourceId: string; targetType: LinkTargetType; targetId: string;
  createdAt?: string; updatedAt?: string;
}

// Domain records (shape of FULL_LIFE_CONTROL_BACKUP sections).
export interface Payment { id?: string; date: string; amount: number; note?: string }
export interface Bill {
  id: string; title: string; payee?: string; category?: string; originalBalance: number; remainingBalance: number;
  dueDate?: string; isRecurring?: boolean; apr?: number; minimum?: number; paymentHistory?: Payment[]; createdAt?: string; updatedAt?: string;
}
export interface Decision {
  id: string; title: string; context?: string; expectedOutcome?: string; confidence?: number; risk?: 'High' | 'Medium' | 'Low';
  reviewDate?: string; reviewed?: boolean; actualOutcome?: string; options?: Option[]; chosen?: string; decidedOn?: string; createdAt?: string; updatedAt?: string;
}
export interface Loop { id: string; title: string; status: string; createdDate?: string }
export interface PersonRec { id: string; name: string; relationship?: string; lastContact?: string; frequencyDays?: number; phone?: string; updatedAt?: string }
export interface Insight { id: string; tone?: string; text?: string }
export interface LifeData { bills: Bill[]; decisions: Decision[]; loops: Loop[]; people: PersonRec[]; insights: Insight[]; projects: Project[]; goals: Goal[]; links: LinkRecord[]; extras?: Record<string, unknown> }
