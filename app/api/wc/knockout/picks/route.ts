import { auth } from '@/lib/auth';
import { sql, db } from '@vercel/postgres';
import { Resend } from 'resend';
import { KnockoutPickInput, WcKnockoutPick } from '@/lib/wc-definitions';
import {
  WC_LEAGUES,
  WC_KNOCKOUT_ROUNDS,
  WC_ROUND_FIXTURE_LABELS,
  getKnockoutDeadline
} from '@/lib/wc-constants';
import { isSurvivor } from '@/lib/knockout';

const KNOCKOUT_ROUNDS = new Set<number>(WC_KNOCKOUT_ROUNDS);

// Confirm the signed-in user belongs to the given league.
async function isMember(userId: string, leagueId: number): Promise<boolean> {
  const { rows } = await sql.query(
    `SELECT 1 FROM user_leagues WHERE user_id = $1 AND league_id = $2 LIMIT 1`,
    [userId, leagueId]
  );
  return rows.length > 0;
}

// ── GET: the user's knockout picks for a league ──────────────────────────────

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
  if (!(await isMember(userId, leagueId))) {
    return Response.json(
      { error: 'Not a member of this league' },
      { status: 403 }
    );
  }

  try {
    const { rows } = await sql.query<WcKnockoutPick>(
      `SELECT
        round_number,
        fixture_id,
        home_score,
        away_score,
        points,
        submitted_at,
        last_amended_at
      FROM wc_knockout_picks
      WHERE user_id = $1 AND league_id = $2
      ORDER BY round_number`,
      [userId, leagueId]
    );
    return Response.json(rows);
  } catch (error) {
    console.error('Error fetching WC knockout picks:', error);
    return Response.json({ error: 'Failed to fetch picks' }, { status: 500 });
  }
}

// ── POST: submit / amend knockout score predictions ──────────────────────────

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
    const leagueId: number = body.league_id;
    const picks: KnockoutPickInput[] = body.picks;

    const leagueMeta = WC_LEAGUES[leagueId];
    if (!Number.isInteger(leagueId) || !leagueMeta) {
      return Response.json({ error: 'Invalid league_id' }, { status: 400 });
    }
    if (!Array.isArray(picks) || picks.length === 0) {
      return Response.json({ error: 'No picks provided' }, { status: 400 });
    }
    if (!(await isMember(userId, leagueId))) {
      return Response.json(
        { error: 'Not a member of this league' },
        { status: 403 }
      );
    }

    // Eligibility: the original game is survivors-only; the parallel game is open.
    if (!leagueMeta.knockoutOnly && !(await isSurvivor(userId, leagueId))) {
      return Response.json(
        { error: 'You are not eligible to play the knockout in this game' },
        { status: 403 }
      );
    }

    // Round numbers must be knockout rounds and unique within the submission.
    const roundNumbers = picks.map((p) => p.round_number);
    if (roundNumbers.some((r) => !KNOCKOUT_ROUNDS.has(r))) {
      return Response.json(
        { error: 'Round number must be a knockout round (7–11)' },
        { status: 400 }
      );
    }
    if (new Set(roundNumbers).size !== roundNumbers.length) {
      return Response.json(
        { error: 'Duplicate round numbers in submission' },
        { status: 400 }
      );
    }

    // Scores must be sensible non-negative integers.
    for (const pick of picks) {
      for (const score of [pick.home_score, pick.away_score]) {
        if (!Number.isInteger(score) || score < 0 || score > 99) {
          return Response.json(
            { error: 'Scores must be whole numbers between 0 and 99' },
            { status: 400 }
          );
        }
      }
    }

    // Load the predicted fixture for each submitted round.
    const { rows: fixtures } = await sql.query<{
      id: number;
      round_number: number;
      home_team_name: string | null;
      away_team_name: string | null;
      kickoff_time: string;
    }>(
      `SELECT id, round_number, home_team_name, away_team_name, kickoff_time
       FROM wc_knockout_fixtures
       WHERE round_number = ANY($1::int[]) AND is_predicted = true`,
      [roundNumbers]
    );
    const fixtureByRound = new Map(fixtures.map((f) => [f.round_number, f]));

    const now = new Date();
    for (const pick of picks) {
      const fixture = fixtureByRound.get(pick.round_number);
      if (!fixture) {
        return Response.json(
          { error: `No predicted fixture for Round ${pick.round_number}` },
          { status: 400 }
        );
      }
      if (fixture.id !== pick.fixture_id) {
        return Response.json(
          {
            error: `Fixture ${pick.fixture_id} is not the predicted match for Round ${pick.round_number}`
          },
          { status: 400 }
        );
      }
      if (now > getKnockoutDeadline(fixture.kickoff_time)) {
        return Response.json(
          { error: `Deadline has passed for Round ${pick.round_number}` },
          { status: 400 }
        );
      }
    }

    // Upsert all rounds atomically — never overwrite a pick that has already
    // been scored (points set). fixture_id is rewritten on conflict so an
    // amendment re-points the pick at the current predicted fixture.
    let savedCount = 0;
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const pick of picks) {
        const result = await client.query(
          `INSERT INTO wc_knockout_picks
             (user_id, league_id, round_number, fixture_id, home_score, away_score)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id, league_id, round_number)
           DO UPDATE SET
             fixture_id      = EXCLUDED.fixture_id,
             home_score      = EXCLUDED.home_score,
             away_score      = EXCLUDED.away_score,
             last_amended_at = NOW()
           WHERE wc_knockout_picks.points IS NULL`,
          [
            userId,
            leagueId,
            pick.round_number,
            pick.fixture_id,
            pick.home_score,
            pick.away_score
          ]
        );
        savedCount += result.rowCount ?? 0;
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // Confirmation email (best-effort).
    if (userEmail) {
      try {
        const pickLines = picks
          .slice()
          .sort((a, b) => a.round_number - b.round_number)
          .map((p) => {
            const f = fixtureByRound.get(p.round_number);
            const matchup = `${f?.home_team_name ?? 'TBD'} v ${f?.away_team_name ?? 'TBD'}`;
            return `<li><strong>${WC_ROUND_FIXTURE_LABELS[p.round_number]}</strong> (${matchup}): ${p.home_score}–${p.away_score}</li>`;
          })
          .join('');

        const adminEmail = process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS;
        const resend = new Resend(process.env.AUTH_RESEND_KEY);
        await resend.emails.send({
          from: 'Last Player Standing <noreply@lmsiq.co.uk>',
          to: [userEmail],
          ...(adminEmail && { bcc: [adminEmail] }),
          subject: `${leagueMeta.name} — knockout predictions saved`,
          html: `
            <h2>Hey ${userName} 👋🏻</h2>
            <p>Your knockout score predictions for <strong>${leagueMeta.name}</strong> have been saved!</p>
            <ul>${pickLines}</ul>
            <p>You can amend a prediction up to 1 hour before that match kicks off.</p>
            ${adminEmail ? `<p>If something looks wrong, email <a href="mailto:${adminEmail}">${adminEmail}</a></p>` : ''}
          `
        });
      } catch (emailError) {
        console.error(
          'Failed to send WC knockout confirmation email:',
          emailError
        );
      }
    }

    return Response.json({ success: true, savedCount }, { status: 201 });
  } catch (error) {
    console.error('Error saving WC knockout picks:', error);
    return Response.json({ error: 'Failed to save picks' }, { status: 500 });
  }
}
