import { FixturesData } from '@/lib/definitions';
import { useEffect, useState } from 'react';

const useFixtures = () => {
  const [fixtures, setFixtures] = useState<FixturesData[]>([]);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);

  useEffect(() => {
    async function fetchFixtures() {
      setIsLoadingFixtures(true);
      const res = await fetch('/api/fixtures');
      if (!res.ok) {
        setIsLoadingFixtures(false);
        return;
      }
      const data = await res.json();
      setFixtures(data);
      setIsLoadingFixtures(false);
    }

    fetchFixtures();
  }, []);

  return { fixtures, isLoadingFixtures };
};

export default useFixtures;
