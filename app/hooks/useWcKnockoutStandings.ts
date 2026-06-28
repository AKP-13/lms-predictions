import { useEffect, useState } from 'react';
import { WcKnockoutStanding } from '@/lib/wc-definitions';
import { useSession } from 'next-auth/react';

const useWcKnockoutStandings = ({
  leagueId,
  refreshTrigger
}: {
  leagueId: number | null;
  refreshTrigger: number;
}) => {
  const [wcKnockoutStandings, setWcKnockoutStandings] = useState<
    WcKnockoutStanding[]
  >([]);
  const [isLoadingWcKnockoutStandings, setIsLoadingWcKnockoutStandings] =
    useState(true);

  const { status } = useSession();

  useEffect(() => {
    async function fetchStandings() {
      setIsLoadingWcKnockoutStandings(true);
      const res = await fetch(
        `/api/wc/knockout/standings?league_id=${leagueId}`
      );
      if (!res.ok) {
        setIsLoadingWcKnockoutStandings(false);
        return;
      }
      const data = await res.json();
      setWcKnockoutStandings(data);
      setIsLoadingWcKnockoutStandings(false);
    }

    if (status === 'loading') return;

    if (status === 'authenticated' && leagueId != null) {
      fetchStandings();
    } else {
      setWcKnockoutStandings([]);
      setIsLoadingWcKnockoutStandings(false);
    }
  }, [leagueId, refreshTrigger, status]);

  return { wcKnockoutStandings, isLoadingWcKnockoutStandings };
};

export default useWcKnockoutStandings;
