import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, iso } from './lib/dates';
import * as L from './lib/ledger';
import { addLink, findGoalByTitle, findProjectByTitle, removeLink } from './lib/linker';
import { DEFAULT_WEIGHTS, type Option, type Weights } from './lib/scoring';
import { SEED } from './seed';
import type { Goal, LifeData, LinkSourceType, LinkTargetType, Project } from './types';

interface State {
  inbox: string[]; archive: string[]; weights: Weights; data: LifeData;
  /** id -> 'done' | 'until:YYYY-MM-DD' (snoozed) */
  resolved: Record<string, string>;
  capture: (t: string) => void; archiveAt: (i: number) => void; restoreAt: (i: number) => void;
  setWeight: (k: keyof Weights, pct: number) => void; resetWeights: () => void;
  resolveItem: (id: string) => void; snoozeItem: (id: string, now?: Date) => void;
  pay: (billId: string, amount: number) => void; terms: (billId: string, t: { apr?: number; minimum?: number }) => void;
  addOption: (decisionId: string, o: Option) => void; choose: (decisionId: string, idx: number) => void;
  logContact: (personId: string) => void; savePerson: (personId: string, p: { phone?: string; frequencyDays?: number }) => void; addPerson: (name: string) => string;
  createProject: (title: string, patch?: Partial<Project>) => string;
  createGoal: (title: string, patch?: Partial<Goal>) => string;
  linkEntity: (sourceType: LinkSourceType, sourceId: string, targetType: LinkTargetType, targetId: string) => void;
  unlinkEntity: (sourceType: LinkSourceType, sourceId: string, targetType: LinkTargetType, targetId: string) => void;
  importBackup: (raw: unknown) => boolean; resetData: () => void;
}

const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useStore = create<State>()(persist((set) => {
  const edit = (f: (d: LifeData) => LifeData) => set((s) => ({ data: f(s.data) }));
  return {
    inbox: [], archive: [], weights: DEFAULT_WEIGHTS, data: SEED, resolved: {},
    capture: (t) => { const v = t.trim(); if (v) set((s) => ({ inbox: [v, ...s.inbox] })); },
    archiveAt: (i) => set((s) => { const x = s.inbox[i]; return x === undefined ? s : { inbox: s.inbox.filter((_, n) => n !== i), archive: [x, ...s.archive] }; }),
    restoreAt: (i) => set((s) => { const x = s.archive[i]; return x === undefined ? s : { archive: s.archive.filter((_, n) => n !== i), inbox: [x, ...s.inbox] }; }),
    setWeight: (k, pct) => set((s) => ({ weights: { ...s.weights, [k]: Math.max(0, pct) / 100 } })),
    resetWeights: () => set({ weights: DEFAULT_WEIGHTS }),
    resolveItem: (id) => set((s) => ({ resolved: { ...s.resolved, [id]: 'done' } })),
    snoozeItem: (id, now = new Date()) => set((s) => ({ resolved: { ...s.resolved, [id]: `until:${addDays(iso(now), 1)}` } })),
    pay: (id, amount) => edit((d) => L.payBill(d, id, amount)),
    terms: (id, t) => edit((d) => L.setTerms(d, id, t)),
    addOption: (id, o) => edit((d) => L.addOption(d, id, o)),
    choose: (id, idx) => edit((d) => L.chooseOption(d, id, idx)),
    logContact: (id) => edit((d) => L.logContact(d, id)),
    savePerson: (id, p) => edit((d) => L.savePerson(d, id, p)),
    addPerson: (name) => { const id = `p_${Date.now().toString(36)}`; edit((d) => L.addPerson(d, id, name)); return id; },
    createProject: (title, patch = {}) => {
      const id = makeId('project');
      edit((d) => ({
        ...d,
        projects: [...d.projects, { id, title, status: 'active', progress: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...patch }],
      }));
      return id;
    },
    createGoal: (title, patch = {}) => {
      const id = makeId('goal');
      edit((d) => ({
        ...d,
        goals: [...d.goals, { id, title, status: 'active', progress: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...patch }],
      }));
      return id;
    },
    linkEntity: (sourceType, sourceId, targetType, targetId) => {
      edit((d) => addLink(d, sourceType, sourceId, targetType, targetId));
    },
    unlinkEntity: (sourceType, sourceId, targetType, targetId) => {
      edit((d) => removeLink(d, sourceType, sourceId, targetType, targetId));
    },
    importBackup: (raw) => { const d = L.normalizeBackup(raw); if (!d) return false; set({ data: d, resolved: {} }); return true; },
    resetData: () => set({ data: SEED, resolved: {} }),
  };
}, { name: 'lifeos-mission-control' }));

export const getProjectRef = (d: LifeData, title: string) => findProjectByTitle(d, title);
export const getGoalRef = (d: LifeData, title: string) => findGoalByTitle(d, title);

/** Is this recommendation visible today (not done, not snoozed)? */
export const isLive = (resolved: Record<string, string>, id: string, now = new Date()) => {
  const v = resolved[id];
  return !v || (v !== 'done' && v.slice(6) <= iso(now));
};
