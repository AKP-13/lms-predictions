import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (session?.user?.email !== process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const adminUserId = session!.user!.id;

    const body = await request.json();
    const {
      target_user_id,
      team_selected,
      team_opposing,
      team_selected_location,
      result_selected,
      fpl_gw,
      round_number
    } = body;

    if (
      !target_user_id ||
      !team_selected ||
      !team_opposing ||
      !team_selected_location ||
      !result_selected ||
      !fpl_gw ||
      !round_number
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { rows } = await sql.query(
      `
      WITH games_numbered AS (
        SELECT
          id AS game_id,
          league_id,
          ROW_NUMBER() OVER (PARTITION BY league_id ORDER BY id) AS game_number
        FROM games
      )
      SELECT
        game_id
        , league_id
        , game_number
      FROM games_numbered
      WHERE league_id = (
        SELECT
            league_id
        FROM user_leagues
        WHERE user_id = ($1)
      )
      ORDER BY game_id DESC
      LIMIT 1;
      `,
      [target_user_id]
    );

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not part of a league' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { game_id, league_id } = rows[0];

    const adminLeagueQuery = await sql.query<{ league_id: number }>(
      `SELECT league_id FROM user_leagues WHERE user_id = $1`,
      [adminUserId]
    );
    const adminLeagueId = adminLeagueQuery.rows[0]?.league_id;

    if (!adminLeagueId || adminLeagueId !== league_id) {
      return new Response(
        JSON.stringify({ error: 'Target user is not in your league' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const duplicateCheck = await sql.query(
      `SELECT 1 FROM results WHERE user_id = $1 AND game_id = $2 AND fpl_gw = $3 LIMIT 1`,
      [target_user_id, game_id, fpl_gw]
    );

    if (duplicateCheck.rows.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Prediction already exists for this user and gameweek'
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await sql.query(
      `
        INSERT INTO results (
            user_id
            , game_id
            , team_selected
            , team_opposing
            , team_selected_location
            , result_selected
            , correct
            , fpl_gw
            , round_number
            , team_selected_score
            , team_opposing_score
            , league_id
            , prediction_submitted_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`,
      [
        target_user_id,
        game_id,
        team_selected,
        team_opposing,
        team_selected_location,
        result_selected,
        null,
        fpl_gw,
        round_number,
        null,
        null,
        league_id,
        new Date().toISOString()
      ]
    );

    return new Response(JSON.stringify('success'), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('error in POST /api/admin/predictions', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
