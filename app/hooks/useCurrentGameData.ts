import { CurrentGameResults } from '@/lib/definitions';
import { useEffect, useState } from 'react';

const useCurrentGameData = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [currentGameResults, setCurrentGameResults] = useState(
    [] as CurrentGameResults[]
  );
  const [isLoadingCurrentGameData, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch('/api/currentGameData');
      const currentGameResults: CurrentGameResults[] = await res.json();

      setCurrentGameResults(currentGameResults);
      setIsLoading(false);
    };

    fetchData();
  }, [refreshTrigger]);

  return { currentGameResults, isLoadingCurrentGameData };
};

export default useCurrentGameData;
