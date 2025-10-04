import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const useLeagueInfo = () => {
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [isLoadingLeagueName, setIsLoadingLeagueName] = useState(true);

  const { data: session } = useSession();

  useEffect(() => {
    async function fetchLeagueInfo() {
      setIsLoadingLeagueName(true);
      const res = await fetch('/api/league-info');
      const data = await res.json();
      setLeagueName(data);
      setIsLoadingLeagueName(false);
    }

    if (session) {
      fetchLeagueInfo();
    } else {
      setIsLoadingLeagueName(false);
    }
  }, [session]);

  return { leagueName, isLoadingLeagueName };
};

export default useLeagueInfo;
