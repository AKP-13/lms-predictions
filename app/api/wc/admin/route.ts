import { sql, db } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';

// PATCH /api/wc/admin
// Records a fixture score, marks it complete, and resolves all picks for it.
// Re-submitting a completed fixture overwrites the score and re-resolves picks.
// Body: { fixture_id: number, home_team_score: number, away_team_score: number }
//
// A pick is correct if the picked team won (higher score after 90 min).
// Draws = everyone who picked either team is incorrect (only wins count).
// Auth: WC_ADMIN_SECRET header (curl) or a signed-in admin session (/admin UI).

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

    // Fetch fixture to get team IDs
    const { rows: fixtures } = await sql.query<{
      home_team_id: number;
      away_team_id: number;
      is_complete: boolean;
    }>(
      `SELECT home_team_id, away_team_id, is_complete FROM wc_fixtures WHERE id = $1`,
      [fixture_id]
    );

    if (!fixtures.length) {
      return Response.json(
        { error: `Fixture ${fixture_id} not found` },
        { status: 404 }
      );
    }

    const {
      home_team_id,
      away_team_id,
      is_complete: was_complete
    } = fixtures[0];

    // Determine winning team (null = draw, draws eliminate everyone)
    const winner_team_id =
      home_team_score > away_team_score
        ? home_team_id
        : away_team_score > home_team_score
          ? away_team_id
          : null;

    // Atomically record the result and re-resolve picks so we can't end up
    // with a completed fixture whose picks were never updated.
    // Picks are recomputed from scratch so a corrected score also corrects
    // previously-resolved picks; a pick is correct only if the picked team
    // won outright.
    const client = await db.connect();
    let rowCount = 0;
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE wc_fixtures
         SET home_team_score = $1, away_team_score = $2, is_complete = TRUE
         WHERE id = $3`,
        [home_team_score, away_team_score, fixture_id]
      );
      const picks = await client.query(
        `UPDATE wc_picks
         SET is_correct = (picked_team_id = $1)
         WHERE fixture_id = $2`,
        [winner_team_id ?? -1, fixture_id] // -1 means no winner → all picks = false
      );
      rowCount = picks.rowCount ?? 0;
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e; // bubbles to the outer catch → 500
    } finally {
      client.release();
    }

    return Response.json({
      success: true,
      fixture_id,
      home_team_score,
      away_team_score,
      winner_team_id,
      picks_resolved: rowCount ?? 0,
      was_complete
    });
  } catch (error) {
    console.error('WC admin error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
