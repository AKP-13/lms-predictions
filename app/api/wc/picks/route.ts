import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';
import { WcPick } from '@/lib/wc-definitions';
import { WC_ROUND_DEADLINES } from '@/lib/wc-constants';

// ── GET: fetch current user's picks ──────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await sql.query<WcPick>(
      `SELECT
        p.round_number,
        p.fixture_id,
        p.picked_team_id,
        p.is_correct,
        p.submitted_at,
        p.last_amended_at
      FROM wc_picks p
      WHERE p.user_id = $1
        AND p.league_id = (
          SELECT league_id FROM user_leagues WHERE user_id = $1 LIMIT 1
        )
      ORDER BY p.round_number`,
      [session.user.id]
    );

    return Response.json(rows);
  } catch (error) {
    console.error('Error fetching WC picks:', error);
    return Response.json({ error: 'Failed to fetch picks' }, { status: 500 });
  }
}

// ── POST: submit / amend picks (all rounds at once) ───────────────────────────

type PickInput = {
  round_number: number;
  fixture_id: number;
  picked_team_id: number;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  const userName = session.user.user_name || 'there';

  try {
    const body = await request.json();
    const picks: PickInput[] = body.picks;

    if (!Array.isArray(picks) || picks.length === 0) {
      return Response.json({ error: 'No picks provided' }, { status: 400 });
    }

    // Resolve league_id
    const leagueResult = await sql.query<{ league_id: number }>(
      `SELECT league_id FROM user_leagues WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    if (!leagueResult.rows.length) {
      return Response.json({ error: 'User is not part of a league' }, { status: 400 });
    }
    const { league_id } = leagueResult.rows[0];

    // Validate round numbers are in range and unique within the submission
    const roundNumbers = picks.map((p) => p.round_number);
    if (roundNumbers.some((r) => r < 1 || r > 6)) {
      return Response.json({ error: 'Round number must be between 1 and 6' }, { status: 400 });
    }
    if (new Set(roundNumbers).size !== roundNumbers.length) {
      return Response.json({ error: 'Duplicate round numbers in submission' }, { status: 400 });
    }

    // Check deadlines — reject any pick for a locked round
    const now = new Date();
    for (const pick of picks) {
      if (now > WC_ROUND_DEADLINES[pick.round_number]) {
        return Response.json(
          { error: `Deadline has passed for Round ${pick.round_number}` },
          { status: 400 }
        );
      }
    }

    // Validate each fixture_id exists and picked_team_id is a participant
    for (const pick of picks) {
      const { rows } = await sql.query<{ home_team_id: number; away_team_id: number }>(
        `SELECT home_team_id, away_team_id FROM wc_fixtures WHERE id = $1`,
        [pick.fixture_id]
      );
      if (!rows.length) {
        return Response.json(
          { error: `Fixture ${pick.fixture_id} not found` },
          { status: 400 }
        );
      }
      const { home_team_id, away_team_id } = rows[0];
      if (pick.picked_team_id !== home_team_id && pick.picked_team_id !== away_team_id) {
        return Response.json(
          { error: `Team ${pick.picked_team_id} does not play in fixture ${pick.fixture_id}` },
          { status: 400 }
        );
      }
    }

    // Cross-round uniqueness: no team can be picked twice across all submitted rounds
    const submittedTeamIds = picks.map((p) => p.picked_team_id);
    if (new Set(submittedTeamIds).size !== submittedTeamIds.length) {
      return Response.json(
        { error: 'The same team cannot be picked in more than one round' },
        { status: 400 }
      );
    }

    // Also check against existing picks for rounds NOT being replaced
    const replacedRounds = new Set(roundNumbers);
    const { rows: existingPicks } = await sql.query<{ round_number: number; picked_team_id: number }>(
      `SELECT round_number, picked_team_id FROM wc_picks
       WHERE user_id = $1 AND league_id = $2 AND is_correct IS NULL`,
      [userId, league_id]
    );
    for (const existing of existingPicks) {
      if (!replacedRounds.has(existing.round_number)) {
        if (submittedTeamIds.includes(existing.picked_team_id)) {
          return Response.json(
            { error: `That team is already picked in Round ${existing.round_number}` },
            { status: 400 }
          );
        }
      }
    }

    // Upsert picks — never overwrite a settled pick (is_correct IS NOT NULL)
    let savedCount = 0;
    for (const pick of picks) {
      const result = await sql.query(
        `INSERT INTO wc_picks (user_id, league_id, round_number, fixture_id, picked_team_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, league_id, round_number)
         DO UPDATE SET
           fixture_id     = EXCLUDED.fixture_id,
           picked_team_id = EXCLUDED.picked_team_id,
           last_amended_at = NOW()
         WHERE wc_picks.is_correct IS NULL`,
        [userId, league_id, pick.round_number, pick.fixture_id, pick.picked_team_id]
      );
      savedCount += result.rowCount ?? 0;
    }

    // Send confirmation email
    if (userEmail) {
      try {
        // Fetch team names for the email summary
        const teamIds = [...new Set(picks.map((p) => p.picked_team_id))];
        const { rows: teamRows } = await sql.query<{ id: number; name: string }>(
          `SELECT id, name FROM wc_teams WHERE id = ANY($1::int[])`,
          [teamIds]
        );
        const teamNameById = Object.fromEntries(teamRows.map((t) => [t.id, t.name]));

        const pickLines = picks
          .sort((a, b) => a.round_number - b.round_number)
          .map((p) => `<li><strong>Round ${p.round_number}:</strong> ${teamNameById[p.picked_team_id]}</li>`)
          .join('');

        const resend = new Resend(process.env.AUTH_RESEND_KEY);
        await resend.emails.send({
          from: 'Last Player Standing <noreply@lmsiq.co.uk>',
          to: [userEmail],
          bcc: [process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS || ''],
          subject: 'World Cup 2026 — picks submitted',
          html: `
            <h2>Hey ${userName} 👋🏻</h2>
            <p>Your World Cup 2026 picks have been saved!</p>
            <ul>${pickLines}</ul>
            <p>You can amend any pick up to 2 hours before that round's first kick-off.</p>
            <p>If something looks wrong, email <a href="mailto:${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}">${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}</a></p>
          `
        });
      } catch (emailError) {
        // Don't fail the request if email sending fails
        console.error('Failed to send WC picks confirmation email:', emailError);
      }
    }

    return Response.json({ success: true, savedCount }, { status: 201 });
  } catch (error) {
    console.error('Error saving WC picks:', error);
    return Response.json({ error: 'Failed to save picks' }, { status: 500 });
  }
}
