import { sql } from '@vercel/postgres';
import { DEFAULT_LEAGUE_ID } from '@/lib/constants';

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
