import 'server-only';

import { sql } from '@vercel/postgres';
import { ATTEMPT_WINDOW_MS, RecentAttempts } from '@/lib/credentials';

// Rows older than this are past every window, so the record step deletes them.
const RETENTION = '1 day';

type AttemptRow = { attempted_at: Date };

// Also drops the rows that no window can reach again.
export async function recordFailedAttempt(
  email: string | null,
  ip: string | null
): Promise<void> {
  await sql.query(
    `INSERT INTO failed_sign_in_attempts (email, ip_address) VALUES ($1, $2)`,
    [email, ip]
  );
  await sql.query(
    `DELETE FROM failed_sign_in_attempts
     WHERE attempted_at < NOW() - INTERVAL '${RETENTION}'`
  );
}

export async function recentAttempts(
  email: string | null,
  ip: string | null,
  now: Date
): Promise<RecentAttempts> {
  const since = new Date(now.getTime() - ATTEMPT_WINDOW_MS);
  const [byEmail, byIp] = await Promise.all([
    attemptsSince('email', email, since),
    attemptsSince('ip_address', ip, since)
  ]);
  return { byEmail, byIp };
}

// The recorded email is always normalised, so the caller's copy must match.
export async function clearAttemptsForEmail(email: string): Promise<void> {
  await sql.query(`DELETE FROM failed_sign_in_attempts WHERE email = $1`, [
    email.toLowerCase().trim()
  ]);
}

// The column name is a literal from this module, never user input.
async function attemptsSince(
  column: 'email' | 'ip_address',
  value: string | null,
  since: Date
): Promise<Date[]> {
  if (!value) return [];
  const result = await sql.query<AttemptRow>(
    `SELECT attempted_at
     FROM failed_sign_in_attempts
     WHERE ${column} = $1 AND attempted_at >= $2`,
    [value, since.toISOString()]
  );
  return result.rows.map((row) => new Date(row.attempted_at));
}
