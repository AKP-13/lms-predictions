import { CurrentGameResults } from '@/lib/definitions';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const useCurrentGameData = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [currentGameResults, setCurrentGameResults] = useState(
    [] as CurrentGameResults[]
  );
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isLoadingCurrentGameData, setIsLoading] = useState(true);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch('/api/currentGameData');
      const {
        latestGameResults,
        latestGameId
      }: {
        latestGameResults: CurrentGameResults[];
        latestGameId: number | null;
      } = await res.json();

      setCurrentGameResults(latestGameResults);
      setCurrentGameId(latestGameId);
      setIsLoading(false);
    };

    if (session) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [refreshTrigger, session]);

  return { currentGameResults, currentGameId, isLoadingCurrentGameData };
};

export default useCurrentGameData;
