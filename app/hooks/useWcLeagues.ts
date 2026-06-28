import { useEffect, useState } from 'react';
import { WcLeagueMembership } from '@/lib/wc-definitions';
import { useSession } from 'next-auth/react';

const useWcLeagues = () => {
  const [wcLeagues, setWcLeagues] = useState<WcLeagueMembership[]>([]);
  const [isLoadingWcLeagues, setIsLoadingWcLeagues] = useState(true);

  const { status } = useSession();

  useEffect(() => {
    async function fetchLeagues() {
      setIsLoadingWcLeagues(true);
      const res = await fetch('/api/wc/knockout/leagues');
      if (!res.ok) {
        setIsLoadingWcLeagues(false);
        return;
      }
      const data = await res.json();
      setWcLeagues(data);
      setIsLoadingWcLeagues(false);
    }

    // Hold loading until the session resolves so we never flash an empty selector.
    if (status === 'loading') return;

    if (status === 'authenticated') {
      fetchLeagues();
    } else {
      setWcLeagues([]);
      setIsLoadingWcLeagues(false);
    }
  }, [status]);

  return { wcLeagues, isLoadingWcLeagues };
};

export default useWcLeagues;
