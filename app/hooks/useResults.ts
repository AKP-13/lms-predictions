import { useEffect, useState } from 'react';
import { Results } from '@/lib/definitions';

const useResults = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [results, setResults] = useState<Record<number, Results[]>>({});
  const [isLoadingResults, setIsLoadingResults] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoadingResults(true);
      const res = await fetch('/api/results');
      const results = await res.json();
      setResults(results);
      setIsLoadingResults(false);
    }

    fetchResults();
  }, [refreshTrigger]);

  return { results, isLoadingResults };
};

export default useResults;
