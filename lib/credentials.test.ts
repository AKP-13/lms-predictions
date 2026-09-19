import { describe, it, expect } from 'vitest';
import {
  decideSignIn,
  normaliseEmail,
  passwordLengthError
} from './credentials';

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

// ── decideSignIn ─────────────────────────────────────────────────────────────

describe('decideSignIn', () => {
  const verifiedUser = {
    passwordHash: '$2b$12$hash',
    emailVerified: new Date('2026-09-01T10:00:00Z')
  };

  it('allows a verified user whose password matches, and hands back the user', () => {
    const decision = decideSignIn(verifiedUser, true);

    expect(decision).toEqual({ allow: true, user: verifiedUser });
  });

  it('refuses a correct password on an account whose email is not verified', () => {
    const unverifiedUser = { ...verifiedUser, emailVerified: null };

    const decision = decideSignIn(unverifiedUser, true);

    expect(decision.allow).toBe(false);
  });

  it('refuses a verified user whose password does not match', () => {
    const decision = decideSignIn(verifiedUser, false);

    expect(decision.allow).toBe(false);
  });

  it('refuses an account with no password set, whatever the match result', () => {
    const magicLinkOnlyUser = { ...verifiedUser, passwordHash: null };

    const decision = decideSignIn(magicLinkOnlyUser, true);

    expect(decision.allow).toBe(false);
  });

  it('refuses when no account has that email', () => {
    const decision = decideSignIn(null, false);

    expect(decision.allow).toBe(false);
  });

  it('gives every refusal the same generic reason', () => {
    const refusals = [
      decideSignIn(null, false),
      decideSignIn({ ...verifiedUser, passwordHash: null }, true),
      decideSignIn({ ...verifiedUser, emailVerified: null }, true),
      decideSignIn(verifiedUser, false)
    ];

    const reasons = refusals.map((r) => (r.allow ? 'allowed' : r.reason));

    expect(new Set(reasons)).toEqual(
      new Set([
        'Sign in failed. Check your email and password, and that you have verified your email address.'
      ])
    );
  });
});
