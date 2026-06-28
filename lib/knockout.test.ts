import { describe, it, expect } from 'vitest';
import { computeKnockoutPoints } from './knockout';

describe('computeKnockoutPoints', () => {
  it('awards 5 for an exact score', () => {
    expect(computeKnockoutPoints(2, 1, 2, 1)).toBe(5);
    expect(computeKnockoutPoints(0, 0, 0, 0)).toBe(5);
  });

  it('awards 2 for the correct result but wrong score', () => {
    // Predicted home win, actual home win (different scoreline)
    expect(computeKnockoutPoints(2, 1, 3, 0)).toBe(2);
    // Predicted away win, actual away win
    expect(computeKnockoutPoints(0, 1, 1, 3)).toBe(2);
    // Predicted draw, actual draw (different scoreline)
    expect(computeKnockoutPoints(1, 1, 2, 2)).toBe(2);
  });

  it('awards 0 for the wrong result', () => {
    // Predicted home win, actual away win
    expect(computeKnockoutPoints(2, 1, 0, 1)).toBe(0);
    // Predicted draw, actual home win
    expect(computeKnockoutPoints(1, 1, 2, 1)).toBe(0);
    // Predicted home win, actual draw
    expect(computeKnockoutPoints(1, 0, 1, 1)).toBe(0);
  });

  it('prefers the exact-score bonus over the result points', () => {
    // Exact draw scoreline still scores 5, not 2
    expect(computeKnockoutPoints(1, 1, 1, 1)).toBe(5);
  });
});
