import { sql } from '@vercel/postgres';
import { WcFixture } from '@/lib/wc-definitions';

export async function GET() {
  try {
    const { rows } = await sql.query<WcFixture>(
      `SELECT
        f.id,
        f.round_number,
        f.group_name,
        f.kickoff_time,
        f.venue,
        f.home_team_score,
        f.away_team_score,
        f.is_complete,
        f.home_win_probability::float AS home_win_probability,
        f.away_win_probability::float AS away_win_probability,
        ht.id         AS home_team_id,
        ht.name       AS home_team_name,
        ht.short_name AS home_team_short,
        at.id         AS away_team_id,
        at.name       AS away_team_name,
        at.short_name AS away_team_short
      FROM wc_fixtures f
      JOIN wc_teams ht ON ht.id = f.home_team_id
      JOIN wc_teams at ON at.id = f.away_team_id
      ORDER BY f.round_number, f.kickoff_time`
    );

    return Response.json(rows, {
      headers: { 'Cache-Control': 's-maxage=300' }
    });
  } catch (error) {
    console.error('Error fetching WC fixtures:', error);
    return Response.json({ error: 'Failed to fetch fixtures' }, { status: 500 });
  }
}
