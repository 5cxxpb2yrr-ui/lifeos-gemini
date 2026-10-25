import { beforeEach, describe, expect, it } from 'vitest';
import { getLinkedGoals, getLinkedProjects } from '../../src/mission/lib/linker';
import { useStore } from '../../src/mission/store';
import { DEFAULT_WEIGHTS } from '../../src/mission/lib/scoring';

beforeEach(() => useStore.setState({ inbox: [], archive: [], weights: DEFAULT_WEIGHTS, data: { ...useStore.getState().data, projects: [...useStore.getState().data.projects], goals: [...useStore.getState().data.goals], links: [...useStore.getState().data.links] } }));

describe('store', () => {
  it('captures, archives and restores without losing items', () => {
    const s = useStore.getState();
    s.capture('  Call @Marcus p2 '); s.capture('');
    expect(useStore.getState().inbox).toEqual(['Call @Marcus p2']);
    useStore.getState().archiveAt(0);
    expect(useStore.getState()).toMatchObject({ inbox: [], archive: ['Call @Marcus p2'] });
    useStore.getState().restoreAt(0);
    expect(useStore.getState().inbox).toHaveLength(1);
  });

  it('edits and resets weights', () => {
    useStore.getState().setWeight('urgency', 80);
    expect(useStore.getState().weights.urgency).toBe(0.8);
    useStore.getState().resetWeights();
    expect(useStore.getState().weights).toEqual(DEFAULT_WEIGHTS);
  });

  it('creates and links projects and goals', () => {
    const projectId = useStore.getState().createProject('Home office refresh');
    const goalId = useStore.getState().createGoal('Buy a house');
    const billId = useStore.getState().data.bills[0].id;
    useStore.getState().linkEntity('bill', billId, 'project', projectId);
    useStore.getState().linkEntity('bill', billId, 'goal', goalId);

    const data = useStore.getState().data;
    expect(getLinkedProjects(data, 'bill', billId).some((p) => p.id === projectId)).toBe(true);
    expect(getLinkedGoals(data, 'bill', billId).some((g) => g.id === goalId)).toBe(true);
  });
});
