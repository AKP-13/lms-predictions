import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const useLeagueInfo = () => {
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [isLoadingLeagueInfo, setIsLoadingLeagueInfo] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    async function fetchLeagueInfo() {
      setIsLoadingLeagueInfo(true);
      const res = await fetch('/api/league-info');
      const data = await res.json();
      setLeagueInfo(data);
      setIsLoadingLeagueInfo(false);
    }

    if (session) {
      fetchLeagueInfo();
    }
  }, [session]);

  return { leagueInfo, isLoadingLeagueInfo };
};

export default useLeagueInfo;
