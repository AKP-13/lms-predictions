import { sql } from '@vercel/postgres';

// A user "survived" the group stage — and so may submit knockout picks in the
// original game — iff they have a correct pick in all 6 group rounds and none
// incorrect. (The parallel knockout game is open to everyone, so this check is
// only applied to non-knockout-only leagues.)
export async function isSurvivor(
  userId: string | number,
  leagueId: number
): Promise<boolean> {
  const { rows } = await sql.query<{ correct: string; wrong: string }>(
    `SELECT
        COUNT(*) FILTER (WHERE is_correct = true)  AS correct,
        COUNT(*) FILTER (WHERE is_correct = false) AS wrong
     FROM wc_picks
     WHERE user_id = $1
       AND league_id = $2
       AND round_number BETWEEN 1 AND 6`,
    [userId, leagueId]
  );

  const row = rows[0];
  // COUNT(...) comes back as a string (bigint) from node-postgres.
  return !!row && Number(row.wrong) === 0 && Number(row.correct) === 6;
}
