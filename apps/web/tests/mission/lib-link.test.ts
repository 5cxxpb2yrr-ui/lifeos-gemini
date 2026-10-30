import { describe, expect, it } from 'vitest';
import { SEED } from '../../src/mission/seed';
import { findByTitle, mentionsOf } from '../../src/mission/lib/capture';
import * as L from '../../src/mission/lib/ledger';

describe('>project and ^goal linking', () => {
  it('resolves unique matches and refuses ambiguous ones', () => {
    expect(findByTitle('refresh', SEED.projects)?.id).toBe(1);
    expect(findByTitle('rear', SEED.projects)?.id).toBe(202);
    expect(findByTitle('suspension', SEED.projects)).toBeUndefined(); // two projects
    expect(findByTitle('half', SEED.goals)?.id).toBe('6r1psomj');
    expect(findByTitle('net', SEED.goals)?.id).toBe('6h6hju88');
  });
  it('handles goals that use `name` instead of `title`', () => {
    expect(findByTitle('balanced', SEED.goals)?.id).toBe('g1');
  });
  it('finds the captures that point at a record', () => {
    const texts = ['Order parts >refresh p2', 'Call @Marcus', 'Run ^half'];
    expect(mentionsOf(texts, 'proj', SEED.projects, 1)).toEqual(['Order parts >refresh p2']);
    expect(mentionsOf(texts, 'goal', SEED.goals, '6r1psomj')).toEqual(['Run ^half']);
  });
});

describe('project and goal records', () => {
  it('updates progress for numeric and string ids', () => {
    const d = L.setProgress(L.setProgress(SEED, 'project', '1', 80), 'goal', 'g1', 50);
    expect(d.projects.find((p) => p.id === 1)?.completion).toBe(80);
    expect(d.goals.find((g) => g.id === 'g1')?.progress).toBe(50);
  });
  it('adds projects and goals and keeps them through export/import', () => {
    const d = L.addGoal(L.addProject(SEED, 'prj_x', 'Garage shelves'), 'goal_x', 'Sleep better');
    const back = L.normalizeBackup(L.exportBackup(d))!;
    expect(back.projects.at(-1)?.title).toBe('Garage shelves');
    expect(back.goals.at(-1)?.title).toBe('Sleep better');
    expect(back.projects[0].id).toBe(1); // numeric ids stay numeric
  });
});
