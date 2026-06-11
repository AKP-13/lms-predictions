import { sql } from '@vercel/postgres';
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

    const { home_team_id, away_team_id, is_complete: was_complete } = fixtures[0];

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

    // Resolve all picks for this fixture, recomputing from scratch so a
    // corrected score also corrects previously-resolved picks
    // A pick is correct only if the picked team won outright
    const { rowCount } = await sql.query(
      `UPDATE wc_picks
       SET is_correct = (picked_team_id = $1)
       WHERE fixture_id = $2`,
      [winner_team_id ?? -1, fixture_id] // -1 means no winner → all picks = false
    );

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
