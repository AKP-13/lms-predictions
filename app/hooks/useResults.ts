import { useEffect, useState } from 'react';
import { Results } from '@/lib/definitions';
import { useSession } from 'next-auth/react';

const useResults = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [results, setResults] = useState<Record<number, Results[]>>({});
  const [isLoadingResults, setIsLoadingResults] = useState(true);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingResults(true);
      const res = await fetch('/api/results');
      const results = await res.json();
      setResults(results);
      setIsLoadingResults(false);
    };

    if (session) {
      fetchData();
    } else {
      setIsLoadingResults(false);
    }
  }, [refreshTrigger, session]);

  return { results, isLoadingResults };
};

export default useResults;
