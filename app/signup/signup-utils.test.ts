import { describe, it, expect } from 'vitest';
import { normaliseEmail, passwordLengthError } from './signup-utils';

// ── passwordLengthError ──────────────────────────────────────────────────────

describe('passwordLengthError', () => {
  it('rejects a short password with a message that names the minimum', () => {
    const error = passwordLengthError('short');

    expect(error).toBe('Password must be at least 12 characters.');
  });

  it('accepts a password of exactly 12 characters', () => {
    expect(passwordLengthError('abcdefghijkl')).toBeNull();
  });

  it('rejects a password of 11 characters', () => {
    expect(passwordLengthError('abcdefghijk')).not.toBeNull();
  });

  it('counts characters, not UTF-16 code units', () => {
    // Six emoji are 12 code units but 6 characters.
    expect(passwordLengthError('😀😀😀😀😀😀')).not.toBeNull();
  });
});

// ── normaliseEmail ───────────────────────────────────────────────────────────

describe('normaliseEmail', () => {
  it('lower-cases and trims, matching what the magic link stores', () => {
    expect(normaliseEmail('  Foo@Bar.COM ')).toBe('foo@bar.com');
  });

  // Auth.js throws on these shapes, or rewrites them; reject them before any row exists.
  it.each([
    ['no @ sign', 'foo'],
    ['empty local part', '@bar.com'],
    ['empty domain', 'foo@'],
    ['two @ signs', 'a@b@c.com'],
    ['a quote', '"a"@b.com'],
    ['a comma in the domain', 'a@b.com,c.com'],
    ['whitespace inside', 'a b@c.com']
  ])('rejects an email with %s', (_label, email) => {
    expect(normaliseEmail(email)).toBeNull();
  });
});
