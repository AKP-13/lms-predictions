import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { MIN_GW } from '@/lib/constants';
import { AdminPrediction, Participant } from '@/lib/definitions';
import AdminInputForm from './AdminInputForm';

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.email !== process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS) {
    redirect('/');
  }

  const userId = session!.user!.id;

  const leagueQuery = await sql.query<{ league_id: number }>(
    `SELECT league_id FROM user_leagues WHERE user_id = $1`,
    [userId]
  );
  const leagueId = leagueQuery.rows[0]?.league_id;

  if (!leagueId) redirect('/');

  let fplData: any = null;
  let allFixtures: any[] = [];

  try {
    const [fplRes, fixturesRes] = await Promise.all([
      fetch('https://fantasy.premierleague.com/api/bootstrap-static/'),
      fetch('https://fantasy.premierleague.com/api/fixtures')
    ]);

    if (!fplRes.ok || !fixturesRes.ok)
      throw new Error('FPL API returned non-OK status');

    [fplData, allFixtures] = await Promise.all([
      fplRes.json(),
      fixturesRes.json()
    ]);
  } catch {
    return (
      <main className="p-6">
        <p className="text-red-500">
          Failed to load fixture data from the FPL API. Please refresh the page.
        </p>
      </main>
    );
  }

  if (!fplData?.teams || !Array.isArray(allFixtures)) {
    return (
      <main className="p-6">
        <p className="text-red-500">
          Failed to load fixture data from the FPL API. Please refresh the page.
        </p>
      </main>
    );
  }

  const [participantsQuery, gameQuery] = await Promise.all([
    sql.query<Participant>(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN user_leagues ul ON u.id = ul.user_id
       WHERE ul.league_id = $1
       ORDER BY u.name`,
      [leagueId]
    ),
    sql.query<{ game_id: number }>(
      `SELECT MAX(id) AS game_id FROM games WHERE league_id = $1`,
      [leagueId]
    )
  ]);

  const currentGameId = gameQuery.rows[0]?.game_id;

  if (!currentGameId) {
    return (
      <main className="p-6">
        <p className="text-muted-foreground">
          No active game found for this league.
        </p>
      </main>
    );
  }

  const predictionsQuery = await sql.query<AdminPrediction>(
    `SELECT user_id, team_selected, team_opposing, team_selected_location,
            result_selected, correct, fpl_gw, round_number, prediction_submitted_time
     FROM results
     WHERE game_id = $1
     ORDER BY user_id, round_number ASC`,
    [currentGameId]
  );

  const teamsArr: { id: number; name: string; short_name: string }[] =
    fplData.teams.map(
      ({
        id,
        name,
        short_name
      }: {
        id: number;
        name: string;
        short_name: string;
      }) => ({
        id,
        name,
        short_name
      })
    );

  const currentGwNumber: number =
    fplData.events.find(
      (e: { is_current: boolean; id: number }) => e.is_current
    )?.id ?? MIN_GW;

  const predictionWeekFixtures = allFixtures.filter(
    (f: { event: number }) => f.event === currentGwNumber + 1
  );

  return (
    <main>
      <AdminInputForm
        participants={participantsQuery.rows}
        existingPredictions={predictionsQuery.rows}
        teamsArr={teamsArr}
        predictionWeekFixtures={predictionWeekFixtures}
        currentGwNumber={currentGwNumber}
        currentGameId={currentGameId}
      />
    </main>
  );
}
