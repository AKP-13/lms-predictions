import 'server-only';

import { sql } from '@vercel/postgres';
import { compare, hash } from 'bcrypt';

const BCRYPT_COST = 12;

// bcrypt compares against this when the account has no password, so the response time reveals nothing.
const NO_PASSWORD_HASH =
  '$2b$12$sLAWsRTU7jZOYuTWg.kdIuwAH7QkskGz2HyytKmoTcYkQCFmxlek.';

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  passwordHash: string | null;
};

type UserRow = Omit<UserRecord, 'id' | 'passwordHash'> & {
  id: number;
  password_hash: string | null;
};

// Returns the new user's id, or null when the email already has an account.
// The insert keeps an existing row and its password hash.
export async function createUserWithPassword(
  email: string,
  password: string
): Promise<string | null> {
  const passwordHash = await hash(password, BCRYPT_COST);
  const result = await sql.query<{ id: number }>(
    `INSERT INTO users (email, "emailVerified", password_hash)
     VALUES ($1, NULL, $2)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [email, passwordHash]
  );
  const row = result.rows[0];
  return row ? String(row.id) : null;
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  const result = await sql.query<UserRow>(
    `SELECT id, email, name, image, "emailVerified", password_hash
     FROM users
     WHERE email = $1`,
    [email]
  );
  const row = result.rows[0];
  if (!row) return null;
  const { password_hash: passwordHash, ...rest } = row;
  return { ...rest, id: String(row.id), passwordHash };
}

export async function passwordMatches(
  password: string,
  passwordHash: string | null
): Promise<boolean> {
  const matches = await compare(password, passwordHash ?? NO_PASSWORD_HASH);
  return passwordHash !== null && matches;
}
