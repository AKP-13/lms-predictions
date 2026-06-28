import { sql, db } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { WC_TEAMS } from '@/lib/wc-constants';
import { WcKnockoutFixture } from '@/lib/wc-definitions';

const VALID_TEAM_NAMES = new Set(WC_TEAMS.map((t) => t.name));

const RETURN_COLUMNS = `id, round_number, match_label, home_team_name,
  away_team_name, kickoff_time, is_predicted, home_team_score,
  away_team_score, is_complete`;

// All knockout fixtures (every match is stored for analysis; the one
// is_predicted = true row per round is what players score-predict).
export async function GET() {
  try {
    const { rows } = await sql.query<WcKnockoutFixture>(
      `SELECT
        id,
        round_number,
        match_label,
        home_team_name,
        away_team_name,
        kickoff_time,
        is_predicted,
        home_team_score,
        away_team_score,
        is_complete
      FROM wc_knockout_fixtures
      ORDER BY round_number, kickoff_time`
    );

    return Response.json(rows, {
      headers: { 'Cache-Control': 's-maxage=300' }
    });
  } catch (error) {
    console.error('Error fetching WC knockout fixtures:', error);
    return Response.json(
      { error: 'Failed to fetch knockout fixtures' },
      { status: 500 }
    );
  }
}

// PATCH /api/wc/knockout/fixtures
// Admin-only editor for a fixture's teams, kickoff, or predicted flag. Team names
// must come from WC_TEAMS (or null = TBD). Setting is_predicted = true clears the
// flag on the round's other fixtures so each round keeps exactly one predicted match.
// Body: { fixture_id, home_team_name?, away_team_name?, kickoff_time?, is_predicted? }
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
    const fixtureId = body.fixture_id;
    if (!Number.isInteger(fixtureId)) {
      return Response.json(
        { error: 'fixture_id is required' },
        { status: 400 }
      );
    }

    // Build the partial update from whichever editable fields were provided.
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    for (const field of ['home_team_name', 'away_team_name'] as const) {
      if (field in body) {
        const v = body[field];
        if (v !== null && !VALID_TEAM_NAMES.has(v)) {
          return Response.json(
            { error: `Invalid team name for ${field}` },
            { status: 400 }
          );
        }
        sets.push(`${field} = $${i++}`);
        values.push(v);
      }
    }

    if ('kickoff_time' in body) {
      const v = body.kickoff_time;
      if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) {
        return Response.json(
          { error: 'kickoff_time must be a valid date string' },
          { status: 400 }
        );
      }
      sets.push(`kickoff_time = $${i++}`);
      values.push(v);
    }

    if ('is_predicted' in body) {
      if (typeof body.is_predicted !== 'boolean') {
        return Response.json(
          { error: 'is_predicted must be a boolean' },
          { status: 400 }
        );
      }
      sets.push(`is_predicted = $${i++}`);
      values.push(body.is_predicted);
    }

    if (sets.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { rows: existing } = await sql.query<{ round_number: number }>(
      `SELECT round_number FROM wc_knockout_fixtures WHERE id = $1`,
      [fixtureId]
    );
    if (!existing.length) {
      return Response.json(
        { error: `Knockout fixture ${fixtureId} not found` },
        { status: 404 }
      );
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Keep exactly one predicted match per round.
      if (body.is_predicted === true) {
        await client.query(
          `UPDATE wc_knockout_fixtures
           SET is_predicted = false
           WHERE round_number = $1 AND id <> $2`,
          [existing[0].round_number, fixtureId]
        );
      }

      values.push(fixtureId);
      const { rows } = await client.query<WcKnockoutFixture>(
        `UPDATE wc_knockout_fixtures
         SET ${sets.join(', ')}
         WHERE id = $${i}
         RETURNING ${RETURN_COLUMNS}`,
        values
      );
      await client.query('COMMIT');
      return Response.json(rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('WC knockout fixture update error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
