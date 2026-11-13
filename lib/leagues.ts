import { sql } from '@vercel/postgres';
import { DEFAULT_LEAGUE_ID } from '@/lib/constants';

// The one rule for the league of a user. It reads the user id from $1.
export const USER_LEAGUE_ID_SQL = `(
  SELECT league_id
  FROM user_leagues
  WHERE user_id = ($1)
  ORDER BY league_id
  LIMIT 1
)`;

// Never throws: it logs a failed insert so an admin can backfill the user by hand.
export async function enrolInDefaultLeague(userId: string): Promise<void> {
  try {
    await sql.query(
      `INSERT INTO user_leagues (user_id, league_id, joined_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
      [userId, DEFAULT_LEAGUE_ID]
    );
  } catch (error) {
    console.error(`Failed to add user ${userId} to user_leagues:`, error);
  }
}
