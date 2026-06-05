import { useEffect, useState } from 'react';
import { WcPick } from '@/lib/wc-definitions';
import { useSession } from 'next-auth/react';

const useWcPicks = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [wcPicks, setWcPicks] = useState<WcPick[]>([]);
  const [isLoadingWcPicks, setIsLoadingWcPicks] = useState(true);

  const { data: session } = useSession();

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

    if (session) {
      fetchPicks();
    } else {
      setIsLoadingWcPicks(false);
    }
  }, [refreshTrigger, session]);

  return { wcPicks, isLoadingWcPicks };
};

export default useWcPicks;
