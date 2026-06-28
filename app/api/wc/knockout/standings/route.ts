import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { WC_LEAGUES } from '@/lib/wc-constants';
import { WcKnockoutStanding } from '@/lib/wc-definitions';

// GET /api/wc/knockout/standings?league_id=
// Cumulative knockout points per player for a game. Visible to any member of
// that game (players and spectators alike). Only players who have made at least
// one prediction appear; test accounts are excluded.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const leagueId = Number(new URL(request.url).searchParams.get('league_id'));
  if (!Number.isInteger(leagueId) || !WC_LEAGUES[leagueId]) {
    return Response.json({ error: 'Invalid league_id' }, { status: 400 });
  }

  const member = await sql.query(
    `SELECT 1 FROM user_leagues WHERE user_id = $1 AND league_id = $2 LIMIT 1`,
    [userId, leagueId]
  );
  if (!member.rows.length) {
    return Response.json(
      { error: 'Not a member of this league' },
      { status: 403 }
    );
  }

  try {
    // Roster = anyone who has made a knockout pick in this league, plus the
    // league's group-stage survivors (so the players who are "in" the game show
    // at 0 points before they've predicted). For knockout-only games there are
    // no group picks, so the roster is just the predictors.
    const { rows } = await sql.query<WcKnockoutStanding>(
      `WITH roster AS (
        SELECT DISTINCT user_id FROM wc_knockout_picks WHERE league_id = $1
        UNION
        SELECT user_id FROM wc_picks
          WHERE league_id = $1 AND round_number BETWEEN 1 AND 6
          GROUP BY user_id
          HAVING COUNT(*) FILTER (WHERE is_correct = true) = 6
             AND COUNT(*) FILTER (WHERE is_correct = false) = 0
      )
      SELECT
        r.user_id,
        COALESCE(u.user_name, u.name, u.email) AS user_name,
        COALESCE(SUM(kp.points), 0)::int AS points
      FROM roster r
      JOIN users u ON u.id = r.user_id
      LEFT JOIN wc_knockout_picks kp
        ON kp.user_id = r.user_id AND kp.league_id = $1
      WHERE u.test_user IS NOT TRUE
      GROUP BY r.user_id, u.user_name, u.name, u.email
      ORDER BY points DESC, user_name ASC`,
      [leagueId]
    );
    return Response.json(rows);
  } catch (error) {
    console.error('Error fetching WC knockout standings:', error);
    return Response.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
