import { describe, expect, it } from 'vitest';
import { findPerson, parseCap } from '../../src/mission/lib/capture';

const people = [{ id: '1', name: 'Marcus Chen' }, { id: '2', name: 'Dana Lee' }, { id: '3', name: 'Dana Park' }];

describe('capture', () => {
  it('parses every tag type', () => {
    const p = parseCap('Call @Marcus p2 *phone ^mentorship >move #water(2)');
    expect(p).toMatchObject({ text: 'Call', pri: 2, ctx: ['phone'], people: ['Marcus'], goal: ['mentorship'], proj: ['move'], trk: ['water(2)'] });
  });
  it('resolves people', () => {
    expect(findPerson('Marcus', people)?.id).toBe('1');
    expect(findPerson('marcus.chen', people)?.id).toBe('1');
    expect(findPerson('Dana', people)).toBeUndefined();
  });
});
