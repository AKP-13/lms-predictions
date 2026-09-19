import { describe, it, expect } from 'vitest';
import { splitHash } from './breach-check';

// The lookup itself calls a third party, so only the split is tested here.
describe('splitHash', () => {
  it('splits a known SHA-1 into the prefix and the suffix', () => {
    // SHA-1 of "password" is 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8.
    expect(splitHash('password')).toEqual({
      prefix: '5BAA6',
      suffix: '1E4C9B93F3F0682250B6CF8331B7EE68FD8'
    });
  });

  it('gives the service five characters and keeps the other 35', () => {
    const { prefix, suffix } = splitHash('a-password-nobody-has-used');

    expect(prefix).toHaveLength(5);
    expect(suffix).toHaveLength(35);
  });
});
