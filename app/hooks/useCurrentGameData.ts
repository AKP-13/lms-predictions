import { CurrentGameResults } from '@/lib/definitions';
import { useEffect, useState } from 'react';

const useCurrentGameData = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [currentGameResults, setCurrentGameResults] = useState(
    [] as CurrentGameResults[]
  );
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isLoadingCurrentGameData, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch('/api/currentGameData');
      const {
        latestGameResults,
        latestGameId
      }: { latestGameResults: CurrentGameResults[]; latestGameId: number } =
        await res.json();

      setCurrentGameResults(latestGameResults);
      setCurrentGameId(latestGameId);
      setIsLoading(false);
    };

    fetchData();
  }, [refreshTrigger]);

  return { currentGameResults, currentGameId, isLoadingCurrentGameData };
};

export default useCurrentGameData;
