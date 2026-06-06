import { useEffect, useState } from 'react';
import { WcPick } from '@/lib/wc-definitions';
import { useSession } from 'next-auth/react';

const useWcPicks = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [wcPicks, setWcPicks] = useState<WcPick[]>([]);
  const [isLoadingWcPicks, setIsLoadingWcPicks] = useState(true);

  const { status } = useSession();

  useEffect(() => {
    async function fetchPicks() {
      setIsLoadingWcPicks(true);
      const res = await fetch('/api/wc/picks');
      if (!res.ok) {
        setIsLoadingWcPicks(false);
        return;
      }
      const data = await res.json();
      setWcPicks(data);
      setIsLoadingWcPicks(false);
    }

    // Keep loading=true while the session is still resolving so the consumer
    // never sees a premature "loaded but empty" state.
    if (status === 'loading') return;

    if (status === 'authenticated') {
      fetchPicks();
    } else {
      setIsLoadingWcPicks(false);
    }
  }, [refreshTrigger, status]);

  return { wcPicks, isLoadingWcPicks };
};

export default useWcPicks;
