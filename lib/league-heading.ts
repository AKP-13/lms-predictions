import 'server-only';

import { unstable_cache } from 'next/cache';
import { FPL_BOOTSTRAP_URL } from './constants';
import { fetchLeagueHeading } from './data';
import { LeagueHeading } from './definitions';
import { resolvePredictionGameweek } from './gameweek';

// Caches only the number: the bootstrap is too big for the fetch cache.
// It throws on a failure, so the cache never keeps a missing gameweek.
const fetchPickWeek = unstable_cache(
  async () => {
    // Every dashboard page waits for this, so a slow FPL must not hold them.
    const res = await fetch(FPL_BOOTSTRAP_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error(`FPL bootstrap returned ${res.status}`);
    const { events } = await res.json();
    return resolvePredictionGameweek(events);
  },
  ['pick-week'],
  { revalidate: 300 }
);

// Never throws. Without a heading, the headers show "Last Player Standing".
export async function leagueHeadingFor(
  userId: string | undefined
): Promise<LeagueHeading | null> {
  if (!userId) return null;

  const gameweek = await fetchPickWeek().catch((error) => {
    console.error('Failed to fetch the pick week:', error);
    return null;
  });

  return fetchLeagueHeading({ userId, gameweek }).catch(() => null);
}
