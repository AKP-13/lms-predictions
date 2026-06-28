import { useEffect, useState } from 'react';
import { WcKnockoutPick } from '@/lib/wc-definitions';
import { useSession } from 'next-auth/react';

const useWcKnockoutPicks = ({
  leagueId,
  refreshTrigger
}: {
  leagueId: number | null;
  refreshTrigger: number;
}) => {
  const [wcKnockoutPicks, setWcKnockoutPicks] = useState<WcKnockoutPick[]>([]);
  const [isLoadingWcKnockoutPicks, setIsLoadingWcKnockoutPicks] =
    useState(true);

  const { status } = useSession();

  useEffect(() => {
    async function fetchPicks() {
      setIsLoadingWcKnockoutPicks(true);
      const res = await fetch(`/api/wc/knockout/picks?league_id=${leagueId}`);
      if (!res.ok) {
        setIsLoadingWcKnockoutPicks(false);
        return;
      }
      const data = await res.json();
      setWcKnockoutPicks(data);
      setIsLoadingWcKnockoutPicks(false);
    }

    if (status === 'loading') return;

    if (status === 'authenticated' && leagueId != null) {
      fetchPicks();
    } else {
      setWcKnockoutPicks([]);
      setIsLoadingWcKnockoutPicks(false);
    }
  }, [leagueId, refreshTrigger, status]);

  return { wcKnockoutPicks, isLoadingWcKnockoutPicks };
};

export default useWcKnockoutPicks;
