import { describe, expect, it } from 'vitest';
import { band, exposure, freshness, recommend, score, urgency } from '../../src/mission/lib/scoring';

describe('scoring', () => {
  it('uses the spec impact bands', () => {
    expect([0, 39, 40, 69, 70, 84, 85, 100].map(band)).toEqual(['Low', 'Low', 'Moderate', 'Moderate', 'High', 'High', 'Critical', 'Critical']);
  });
  it('scores an overdue $840 bill as Critical', () => {
    const s = score({ urgency: urgency(-32), exposure: exposure(840), consequence: 0.7, completeness: 1, freshness: freshness(59) });
    expect(s.impact).toBe(86);
    expect(s.confidence).toBe(88);
  });
  it('normalizes custom weights', () => {
    const s = score({ urgency: 1, exposure: 0, consequence: 0, completeness: 1, freshness: 1 }, { urgency: 1, exposure: 0, consequence: 0, completeness: 1, freshness: 1 });
    expect(s.impact).toBe(100);
  });
  it('recommends the highest-scoring option', () => {
    expect(recommend([{ name: 'HMO', value: 5, safety: 2, fit: 3 }, { name: 'PPO', value: 4, safety: 4, fit: 3 }])?.name).toBe('PPO');
  });
});
