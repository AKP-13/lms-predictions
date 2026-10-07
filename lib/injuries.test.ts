import { describe, it, expect } from 'vitest';
import { parseInjuryNews } from './injuries';

describe('parseInjuryNews', () => {
  it('gives the injury and the expected-back date', () => {
    expect(parseInjuryNews('Hamstring injury - Expected back 10 Oct')).toEqual({
      injury: 'Hamstring injury',
      expectedBack: '10 Oct'
    });
  });

  it('gives no date for an unknown return date', () => {
    expect(parseInjuryNews('Knee injury - Unknown return date')).toEqual({
      injury: 'Knee injury',
      expectedBack: null
    });
  });

  it('keeps news with no separator as the injury', () => {
    expect(parseInjuryNews('Illness')).toEqual({
      injury: 'Illness',
      expectedBack: null
    });
  });

  it('gives no injury for empty news', () => {
    expect(parseInjuryNews('')).toEqual({ injury: null, expectedBack: null });
  });
});
