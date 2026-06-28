import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { WC_LEAGUES } from '@/lib/wc-constants';
import { WcLeagueMembership } from '@/lib/wc-definitions';
import { isSurvivor } from '@/lib/knockout';

// The WC games the signed-in user belongs to, each flagged with whether they
// may submit knockout picks there. Powers the game selector.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { rows } = await sql.query<{ league_id: number }>(
      `SELECT league_id FROM user_leagues WHERE user_id = $1`,
      [userId]
    );

    const memberships: WcLeagueMembership[] = [];
    for (const { league_id } of rows) {
      const meta = WC_LEAGUES[league_id];
      if (!meta) continue; // ignore non-WC leagues (e.g. legacy FPL leagues)

      // Knockout-only games are open to all; the original game is survivors-only.
      const eligible = meta.knockoutOnly
        ? true
        : await isSurvivor(userId, league_id);

      memberships.push({
        league_id,
        name: meta.name,
        knockout_only: meta.knockoutOnly,
        eligible
      });
    }

    memberships.sort((a, b) => a.league_id - b.league_id);

    return Response.json(memberships);
  } catch (error) {
    console.error('Error fetching WC leagues:', error);
    return Response.json({ error: 'Failed to fetch leagues' }, { status: 500 });
  }
}
