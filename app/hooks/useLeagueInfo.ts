import { useEffect, useState } from 'react';
import { Results } from '@/lib/definitions';

const useLeagueInfo = () => {
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [isLoadingLeagueInfo, setIsLoadingLeagueInfo] = useState(false);

  useEffect(() => {
    async function fetchLeagueInfo() {
      setIsLoadingLeagueInfo(true);
      const res = await fetch('/api/league-info');
      const data = await res.json();
      setLeagueInfo(data);
      setIsLoadingLeagueInfo(false);
    }

    fetchLeagueInfo();
  }, []);

  return { leagueInfo, isLoadingLeagueInfo };
};

export default useLeagueInfo;
