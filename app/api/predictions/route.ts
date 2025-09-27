import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const session = await auth();

    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    const {
      team_selected,
      team_opposing,
      team_selected_location,
      result_selected,
      fpl_gw,
      round_number
    } = body;

    const { rows } = await sql.query(
      `
      SELECT
            id AS game_id
            , league_id
        FROM games
        WHERE league_id = (
            SELECT
                league_id
            FROM user_leagues
            WHERE user_id = ($1)
        );
        `,
      [userId]
    );

    if (!rows || rows.length === 0) {
      throw new Error('User not part of a league');
    }

    const { game_id, league_id } = rows[0];

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
        userId, // user_id $1
        game_id, // game_id $2
        team_selected, // team_selected $3
        team_opposing, // team_opposing $4
        team_selected_location, // team_selected_location $5
        result_selected, // result_selected $6
        null, // correct $7
        fpl_gw, // fpl_gw $8
        round_number, // round_number $9
        null, // team_selected_score $10
        null, // team_opposing_score $11
        league_id, // league_id $12
        new Date().toISOString() // prediction_submitted_time $13
      ]
    );

    if (userEmail) {
      // Send email using Resend
      const resend = new Resend(process.env.AUTH_RESEND_KEY);

      await resend.emails.send({
        from: 'Last Player Standing <noreply@lmsiq.co.uk>',
        to: [userEmail],
        bcc: ['alexlmsapp@icloud.com'],
        subject: 'Prediction Submitted',
        html: `
            <h2>Your prediction for Round ${round_number} has been submitted!</h2>
            <ul>
            <li><strong>Team:</strong> ${team_selected}</li>
            <li><strong>Outcome:</strong> ${result_selected}</li>
            <li><strong>Opponent:</strong> ${team_opposing}</li>
            <li><strong>Location:</strong> ${team_selected_location}</li>
            </ul>

            <p>If you need to change your prediction, please email <a href="mailto:alexlmsapp@icloud.com">alexlmsapp@icloud.com</a></p>
            `
      });

      return new Response(JSON.stringify('success'), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify('success'), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.log('error in POST /api/predictions', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
