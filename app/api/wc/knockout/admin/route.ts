import { sql, db } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { computeKnockoutPoints } from '@/lib/knockout';

// PATCH /api/wc/knockout/admin
// Records a knockout fixture's result and (re)scores every prediction on it
// across ALL games (5 = exact score, 2 = correct result, 0 otherwise).
// Body: { fixture_id, home_team_score, away_team_score }
// Auth: WC_ADMIN_SECRET header (curl) or a signed-in admin session.

export async function PATCH(request: Request) {
  const secret = request.headers.get('x-admin-secret');
  if (secret !== process.env.WC_ADMIN_SECRET) {
    const session = await auth();
    if (!isAdminEmail(session?.user?.email)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const { fixture_id, home_team_score, away_team_score } = body;

    if (
      !Number.isInteger(fixture_id) ||
      !Number.isInteger(home_team_score) ||
      !Number.isInteger(away_team_score) ||
      home_team_score < 0 ||
      away_team_score < 0
    ) {
      return Response.json(
        { error: 'fixture_id and non-negative integer scores are required' },
        { status: 400 }
      );
    }

    const { rows: fixtures } = await sql.query<{
      round_number: number;
      is_predicted: boolean;
      is_complete: boolean;
    }>(
      `SELECT round_number, is_predicted, is_complete
       FROM wc_knockout_fixtures WHERE id = $1`,
      [fixture_id]
    );
    if (!fixtures.length) {
      return Response.json(
        { error: `Knockout fixture ${fixture_id} not found` },
        { status: 404 }
      );
    }
    const {
      round_number: roundNumber,
      is_predicted: isPredicted,
      is_complete: was_complete
    } = fixtures[0];

    // Atomically record the result and (re)score every prediction on it, so we
    // can't end up with a completed fixture whose picks were never scored. Picks
    // are recomputed from scratch, so a corrected score also corrects points.
    const client = await db.connect();
    let picks_scored = 0;
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE wc_knockout_fixtures
         SET home_team_score = $1, away_team_score = $2, is_complete = TRUE
         WHERE id = $3`,
        [home_team_score, away_team_score, fixture_id]
      );

      // Score picks by round (not fixture_id) so that moving the predicted flag
      // to a different match never orphans previously-saved picks. Only the
      // round's predicted match scores its picks.
      if (isPredicted) {
        const { rows: picks } = await client.query<{
          user_id: number;
          league_id: number;
          round_number: number;
          home_score: number;
          away_score: number;
        }>(
          `SELECT user_id, league_id, round_number, home_score, away_score
           FROM wc_knockout_picks
           WHERE round_number = $1`,
          [roundNumber]
        );

        for (const p of picks) {
          const points = computeKnockoutPoints(
            p.home_score,
            p.away_score,
            home_team_score,
            away_team_score
          );
          await client.query(
            `UPDATE wc_knockout_picks
             SET points = $1
             WHERE user_id = $2 AND league_id = $3 AND round_number = $4`,
            [points, p.user_id, p.league_id, p.round_number]
          );
        }
        picks_scored = picks.length;
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return Response.json({
      success: true,
      fixture_id,
      home_team_score,
      away_team_score,
      picks_scored,
      was_complete
    });
  } catch (error) {
    console.error('WC knockout admin error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
