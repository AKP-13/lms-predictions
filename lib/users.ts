import 'server-only';

import { sql } from '@vercel/postgres';
import { hash } from 'bcrypt';

const BCRYPT_COST = 12;

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
