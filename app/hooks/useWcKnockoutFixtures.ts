import { useEffect, useState } from 'react';
import { WcKnockoutFixture } from '@/lib/wc-definitions';

const useWcKnockoutFixtures = () => {
  const [wcKnockoutFixtures, setWcKnockoutFixtures] = useState<
    WcKnockoutFixture[]
  >([]);
  const [isLoadingWcKnockoutFixtures, setIsLoadingWcKnockoutFixtures] =
    useState(true);

  useEffect(() => {
    async function fetchFixtures() {
      setIsLoadingWcKnockoutFixtures(true);
      const res = await fetch('/api/wc/knockout/fixtures');
      if (!res.ok) {
        setIsLoadingWcKnockoutFixtures(false);
        return;
      }
      const data = await res.json();
      setWcKnockoutFixtures(data);
      setIsLoadingWcKnockoutFixtures(false);
    }

    fetchFixtures();
  }, []);

  return { wcKnockoutFixtures, isLoadingWcKnockoutFixtures };
};

export default useWcKnockoutFixtures;
