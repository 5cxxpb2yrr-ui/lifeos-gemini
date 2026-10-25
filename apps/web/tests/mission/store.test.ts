import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../../src/mission/store';
import { DEFAULT_WEIGHTS } from '../../src/mission/lib/scoring';

beforeEach(() => useStore.setState({ inbox: [], archive: [], weights: DEFAULT_WEIGHTS }));

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
});
