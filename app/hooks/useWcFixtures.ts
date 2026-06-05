import { useEffect, useState } from 'react';
import { WcFixture } from '@/lib/wc-definitions';

const useWcFixtures = () => {
  const [wcFixtures, setWcFixtures] = useState<WcFixture[]>([]);
  const [isLoadingWcFixtures, setIsLoadingWcFixtures] = useState(true);

  useEffect(() => {
    async function fetchFixtures() {
      setIsLoadingWcFixtures(true);
      const res = await fetch('/api/wc/fixtures');
      if (!res.ok) {
        setIsLoadingWcFixtures(false);
        return;
      }
      const data = await res.json();
      setWcFixtures(data);
      setIsLoadingWcFixtures(false);
    }

    fetchFixtures();
  }, []);

  return { wcFixtures, isLoadingWcFixtures };
};

export default useWcFixtures;
