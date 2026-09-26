// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { sql } from '@vercel/postgres';
import { NextRequest } from 'next/server';
import { afterAll, describe, expect, it } from 'vitest';
import { MAX_ATTEMPTS_PER_EMAIL } from './credentials';
import { handlers } from './auth';
import { createUserWithPassword } from './users';

const ORIGIN = 'http://localhost:3000';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Needs a real database. vitest.config.ts loads the URLs from .env and .env.local.
const hasDatabase = Boolean(
  process.env.POSTGRES_URL && process.env.DATABASE_URL
);

describe.runIf(hasDatabase)('password sign-in against the database', () => {
  const email = `sign-in-test-${randomUUID()}@example.com`;
  const password = 'correct horse battery staple';
  let userId: string | null = null;

  afterAll(async () => {
    if (userId) await sql.query('DELETE FROM users WHERE id = $1', [userId]);
    await sql.query('DELETE FROM failed_sign_in_attempts WHERE email = $1', [
      email
    ]);
  });

  it('signs up, verifies, then signs in and gets a one-day session', async () => {
    userId = await createUserWithPassword(email, password);
    expect(userId).not.toBeNull();

    const refused = await postCredentials(email, password);
    expect(refused.headers.get('location')).toContain(
      'error=CredentialsSignin'
    );
    expect(sessionCookie(refused)).toBeUndefined();

    // The same write Auth.js makes when the user clicks the magic link.
    await sql.query('UPDATE users SET "emailVerified" = NOW() WHERE id = $1', [
      userId
    ]);

    const signedIn = await postCredentials(email, password);
    expect(signedIn.headers.get('location')).not.toContain('error=');
    expect(sessionCookie(signedIn)).toBeDefined();

    const before = Date.now();
    const sessionResponse = await handlers.GET(
      new NextRequest(`${ORIGIN}/api/auth/session`, {
        headers: { cookie: cookieHeader(signedIn) }
      })
    );
    const session = await sessionResponse.json();
    expect(session.user).toMatchObject({ id: userId, email });
    const lifetime = new Date(session.expires).getTime() - before;
    expect(lifetime).toBeGreaterThan(ONE_DAY_MS - 60_000);
    expect(lifetime).toBeLessThanOrEqual(ONE_DAY_MS + 60_000);
  }, 30_000);
});

describe.runIf(hasDatabase)('rate limiting against the database', () => {
  const email = `rate-limit-test-${randomUUID()}@example.com`;
  const password = 'correct horse battery staple';
  let userId: string | null = null;

  afterAll(async () => {
    if (userId) await sql.query('DELETE FROM users WHERE id = $1', [userId]);
    await sql.query('DELETE FROM failed_sign_in_attempts WHERE email = $1', [
      email
    ]);
  });

  it('refuses the correct password once the email is over the threshold', async () => {
    userId = await createUserWithPassword(email, password);
    await sql.query('UPDATE users SET "emailVerified" = NOW() WHERE id = $1', [
      userId
    ]);

    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_EMAIL; attempt++) {
      const wrong = await postCredentials(email, 'wrong password entirely');
      expect(sessionCookie(wrong)).toBeUndefined();
    }
    expect(await attemptCount(email)).toBe(MAX_ATTEMPTS_PER_EMAIL);

    const limited = await postCredentials(email, password);
    expect(sessionCookie(limited)).toBeUndefined();

    // The same password works once the attempts fall outside the window.
    await ageAttempts(email);
    const signedIn = await postCredentials(email, password);
    expect(sessionCookie(signedIn)).toBeDefined();

    // A successful sign-in resets the counter for that email.
    expect(await attemptCount(email)).toBe(0);
  }, 60_000);
});

async function attemptCount(email: string): Promise<number> {
  const result = await sql.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM failed_sign_in_attempts WHERE email = $1',
    [email]
  );
  return Number(result.rows[0].count);
}

// Moves the recorded attempts back past the window, as a wait would.
async function ageAttempts(email: string): Promise<void> {
  await sql.query(
    `UPDATE failed_sign_in_attempts
     SET attempted_at = attempted_at - INTERVAL '1 hour'
     WHERE email = $1`,
    [email]
  );
}

// What the browser does when the user submits the password form.
async function postCredentials(
  email: string,
  password: string
): Promise<Response> {
  const csrf = await handlers.GET(new NextRequest(`${ORIGIN}/api/auth/csrf`));
  const { csrfToken } = await csrf.json();
  return handlers.POST(
    new NextRequest(`${ORIGIN}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        cookie: cookieHeader(csrf)
      },
      body: new URLSearchParams({ csrfToken, email, password })
    })
  );
}

// The name=value pairs from the Set-Cookie headers, ready to send back.
function cookieHeader(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ');
}

function sessionCookie(response: Response): string | undefined {
  return response.headers
    .getSetCookie()
    .find((cookie) => cookie.includes('session-token='));
}
