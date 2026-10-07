import { describe, it, expect } from 'vitest';
import { initialsFor } from './initials';

describe('initialsFor', () => {
  it('takes the first letters of the first and last names', () => {
    expect(initialsFor('Alex Peirson', 'alex@example.com')).toBe('AP');
  });

  it('skips middle names', () => {
    expect(initialsFor('Mary Jane Watson', 'mj@example.com')).toBe('MW');
  });

  it('uses one letter for a one-word name', () => {
    expect(initialsFor('Alex', 'alex@example.com')).toBe('A');
  });

  it('capitalises the letters and ignores extra spaces', () => {
    expect(initialsFor('  alex   peirson ', 'alex@example.com')).toBe('AP');
  });

  it('uses the first letter of the email without a name', () => {
    expect(initialsFor(null, 'jamie@example.com')).toBe('J');
    expect(initialsFor('   ', 'jamie@example.com')).toBe('J');
  });

  it('returns nothing without a name or an email', () => {
    expect(initialsFor(null, null)).toBe('');
  });
});
