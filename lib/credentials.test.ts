import { describe, it, expect } from 'vitest';
import {
  ATTEMPT_WINDOW_MS,
  MAX_ATTEMPTS_PER_EMAIL,
  MAX_PASSWORD_BYTES,
  MAX_ATTEMPTS_PER_IP,
  breachLookupError,
  clientIp,
  decideSignIn,
  normaliseEmail,
  passwordLengthError,
  rateLimitError,
  signInDestination
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

  it('accepts a password of exactly 72 bytes', () => {
    expect(passwordLengthError('a'.repeat(MAX_PASSWORD_BYTES))).toBeNull();
  });

  it('rejects a password of 73 bytes, which bcrypt would truncate', () => {
    const error = passwordLengthError('a'.repeat(MAX_PASSWORD_BYTES + 1));

    expect(error).toContain('72 bytes');
  });

  it('counts bytes, not characters', () => {
    // Each emoji is four bytes, so 20 of them pass 72 bytes.
    expect(passwordLengthError('😀'.repeat(20))).toContain('72 bytes');
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

// ── breachLookupError ───────────────────────────────────────────────────────

// SHA-1 of "password" is 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8.
const PASSWORD_SUFFIX = '1E4C9B93F3F0682250B6CF8331B7EE68FD8';

describe('breachLookupError', () => {
  it('rejects a password whose suffix the range response lists', () => {
    const error = breachLookupError(PASSWORD_SUFFIX, {
      answered: true,
      body: `${PASSWORD_SUFFIX}:10382543`
    });

    expect(error).toContain('data breach');
  });

  it('matches a suffix the caller gives in lower case', () => {
    const error = breachLookupError(PASSWORD_SUFFIX.toLowerCase(), {
      answered: true,
      body: `${PASSWORD_SUFFIX}:10382543`
    });

    expect(error).not.toBeNull();
  });

  it('finds a suffix among the other lines of a real response', () => {
    const body = [
      '0018A45C4D1DEF81644B54AB7F969B88D65:1',
      `${PASSWORD_SUFFIX}:10382543`,
      '00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2'
    ].join('\r\n');

    const error = breachLookupError(PASSWORD_SUFFIX, { answered: true, body });

    expect(error).not.toBeNull();
  });

  it('accepts a suffix the response does not list', () => {
    const body = [
      '0018A45C4D1DEF81644B54AB7F969B88D65:1',
      '00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2'
    ].join('\r\n');

    const error = breachLookupError(PASSWORD_SUFFIX, { answered: true, body });

    expect(error).toBeNull();
  });

  // Fail open: a third-party outage must not block sign-up.
  it('accepts the password when the lookup did not answer', () => {
    const error = breachLookupError(PASSWORD_SUFFIX, { answered: false });

    expect(error).toBeNull();
  });

  it('accepts the password when the response is empty', () => {
    const error = breachLookupError(PASSWORD_SUFFIX, {
      answered: true,
      body: ''
    });

    expect(error).toBeNull();
  });
});

// ── rateLimitError ──────────────────────────────────────────────────────────

describe('rateLimitError', () => {
  const now = new Date('2026-09-26T12:00:00Z');

  // Attempts spaced one second apart, the most recent one second ago.
  function recent(count: number): Date[] {
    return Array.from(
      { length: count },
      (_value, index) => new Date(now.getTime() - (index + 1) * 1000)
    );
  }

  const old = new Date(now.getTime() - ATTEMPT_WINDOW_MS - 1000);

  it('accepts an attempt when there are no earlier attempts', () => {
    expect(rateLimitError({ byEmail: [], byIp: [] }, now)).toBeNull();
  });

  it('accepts an attempt one below the email threshold', () => {
    const error = rateLimitError(
      { byEmail: recent(MAX_ATTEMPTS_PER_EMAIL - 1), byIp: [] },
      now
    );

    expect(error).toBeNull();
  });

  it('refuses an attempt at the email threshold', () => {
    const error = rateLimitError(
      { byEmail: recent(MAX_ATTEMPTS_PER_EMAIL), byIp: [] },
      now
    );

    expect(error).not.toBeNull();
  });

  it('refuses an attempt at the IP threshold', () => {
    const error = rateLimitError(
      { byEmail: [], byIp: recent(MAX_ATTEMPTS_PER_IP) },
      now
    );

    expect(error).not.toBeNull();
  });

  it('ignores attempts older than the window', () => {
    const byEmail = Array.from({ length: MAX_ATTEMPTS_PER_EMAIL }, () => old);

    expect(rateLimitError({ byEmail, byIp: [] }, now)).toBeNull();
  });

  it('counts only the attempts inside the window', () => {
    const byEmail = [
      ...Array.from({ length: MAX_ATTEMPTS_PER_EMAIL }, () => old),
      ...recent(MAX_ATTEMPTS_PER_EMAIL - 1)
    ];

    expect(rateLimitError({ byEmail, byIp: [] }, now)).toBeNull();
  });

  it('counts an attempt on the window edge', () => {
    const edge = new Date(now.getTime() - ATTEMPT_WINDOW_MS);
    const byEmail = Array.from({ length: MAX_ATTEMPTS_PER_EMAIL }, () => edge);

    expect(rateLimitError({ byEmail, byIp: [] }, now)).not.toBeNull();
  });

  // The refusal must not read like the wrong-password refusal.
  it('gives a message that differs from the generic refusal', () => {
    const limited = rateLimitError(
      { byEmail: recent(MAX_ATTEMPTS_PER_EMAIL), byIp: [] },
      now
    );
    const refused = decideSignIn(null, false);

    expect(limited).not.toBe(refused.allow ? null : refused.reason);
  });
});

// ── clientIp ────────────────────────────────────────────────────────────────

describe('clientIp', () => {
  it('reads the address the proxy forwarded', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7' });

    expect(clientIp(headers)).toBe('203.0.113.7');
  });

  it('takes the first address of a list', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.7, 198.51.100.2'
    });

    expect(clientIp(headers)).toBe('203.0.113.7');
  });

  it('returns null when no header carries an address', () => {
    expect(clientIp(new Headers())).toBeNull();
  });

  it('returns null for an empty header', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '  ' }))).toBeNull();
  });
});

// ── signInDestination ───────────────────────────────────────────────────────

describe('signInDestination', () => {
  const baseUrl = 'https://lmsiq.co.uk';

  it('lands the forgotten-password flow on the set-password form', () => {
    expect(signInDestination('/account', baseUrl)).toBe(
      'https://lmsiq.co.uk/account#set-password'
    );
  });

  it('sends an ordinary magic link from /login home', () => {
    expect(signInDestination(`${baseUrl}/login`, baseUrl)).toBe(
      'https://lmsiq.co.uk/'
    );
  });

  // Auth.js reads this from a query parameter and a cookie, so anyone can set it.
  it('sends a url it cannot parse home', () => {
    expect(signInDestination('http://', baseUrl)).toBe('https://lmsiq.co.uk/');
  });

  it('rebuilds the destination on our own origin', () => {
    expect(signInDestination('https://evil.example/account', baseUrl)).toBe(
      'https://lmsiq.co.uk/account#set-password'
    );
  });
});
