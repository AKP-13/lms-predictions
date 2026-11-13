import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { WcKnockoutFixture } from '@/lib/wc-definitions';
import KnockoutAdminForm from './knockout-admin-form';

// Hidden admin page for editing knockout fixture teams and entering results.
// Not linked from the nav; non-admins are redirected home. Fixtures are fetched
// with direct SQL (not the cached /api/wc/knockout/fixtures route) so recent
// edits are always reflected.
export default async function KnockoutAdminPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    redirect('/');
  }

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

  const fixtures = rows.map((f) => ({
    ...f,
    kickoff_time: new Date(f.kickoff_time).toISOString()
  }));

  return <KnockoutAdminForm fixtures={fixtures} />;
}
