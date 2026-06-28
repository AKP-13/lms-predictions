import { sql } from '@vercel/postgres';
import { WcKnockoutFixture } from '@/lib/wc-definitions';

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
