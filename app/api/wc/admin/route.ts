import { sql } from '@vercel/postgres';

// PATCH /api/wc/admin
// Marks a fixture complete, records the score, and resolves all picks for it.
// Body: { fixture_id: number, home_team_score: number, away_team_score: number }
//
// A pick is correct if the picked team won (higher score after 90 min).
// Draws = everyone who picked either team is incorrect (only wins count).
// Guarded by WC_ADMIN_SECRET header to prevent accidental use.

export async function PATCH(request: Request) {
  const secret = request.headers.get('x-admin-secret');
  if (secret !== process.env.WC_ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fixture_id, home_team_score, away_team_score } = body;

    if (
      typeof fixture_id !== 'number' ||
      typeof home_team_score !== 'number' ||
      typeof away_team_score !== 'number'
    ) {
      return Response.json(
        { error: 'fixture_id, home_team_score and away_team_score are required numbers' },
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
      return Response.json({ error: `Fixture ${fixture_id} not found` }, { status: 404 });
    }

    if (fixtures[0].is_complete) {
      return Response.json(
        { error: `Fixture ${fixture_id} is already marked complete` },
        { status: 409 }
      );
    }

    const { home_team_id, away_team_id } = fixtures[0];

    // Determine winning team (null = draw, draws eliminate everyone)
    const winner_team_id =
      home_team_score > away_team_score
        ? home_team_id
        : away_team_score > home_team_score
          ? away_team_id
          : null;

    // Update fixture with result
    await sql.query(
      `UPDATE wc_fixtures
       SET home_team_score = $1, away_team_score = $2, is_complete = TRUE
       WHERE id = $3`,
      [home_team_score, away_team_score, fixture_id]
    );

    // Resolve all pending picks for this fixture
    // A pick is correct only if the picked team won outright
    const { rowCount } = await sql.query(
      `UPDATE wc_picks
       SET is_correct = (picked_team_id = $1)
       WHERE fixture_id = $2
         AND is_correct IS NULL`,
      [winner_team_id ?? -1, fixture_id] // -1 means no winner → all picks = false
    );

    return Response.json({
      success: true,
      fixture_id,
      home_team_score,
      away_team_score,
      winner_team_id,
      picks_resolved: rowCount ?? 0
    });
  } catch (error) {
    console.error('WC admin error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
