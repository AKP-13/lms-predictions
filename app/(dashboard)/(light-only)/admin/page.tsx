import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { WcFixture } from '@/lib/wc-definitions';
import AdminResultsForm from './admin-results-form';

// Hidden admin page for entering fixture results. Not linked from the nav —
// non-admins are redirected home. Fixtures are fetched with direct SQL
// (not /api/wc/fixtures) so results entered moments ago aren't hidden by
// that route's 5-minute edge cache.

export default async function AdminPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    redirect('/');
  }

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

  // Raw sql returns kickoff_time as a Date; WcFixture (and the client
  // component boundary) needs a string
  const fixtures = rows.map((f) => ({
    ...f,
    kickoff_time: new Date(f.kickoff_time).toISOString()
  }));

  return <AdminResultsForm fixtures={fixtures} />;
}
