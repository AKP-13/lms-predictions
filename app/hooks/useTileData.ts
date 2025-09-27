import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const useTileData = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [tileData, setTileData] = useState({
    gamesPlayed: { value: 0, caption: 'N/A' },
    bogeyRoundNumber: { value: 'N/A', caption: 'N/A' },
    mostSelected: { value: 'N/A', caption: 'N/A' },
    mostSuccessful: { value: 'N/A', caption: 'N/A' },
    leastSuccessful: { value: 'N/A', caption: 'N/A' },
    bogeyTeam: { value: 'N/A', caption: 'N/A' },
    homeSuccess: { value: 'N/A', caption: 'N/A' },
    awaySuccess: { value: 'N/A', caption: 'N/A' }
  });
  const [isLoadingTileData, setIsLoadingTileData] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTileData(true);
      const res = await fetch('/api/tileData');
      const data = await res.json();

      if (!data.error) {
        const {
          gamesPlayed,
          bogeyRoundNumber,
          mostSelected,
          mostSuccessful,
          leastSuccessful,
          bogeyTeam,
          homeSuccess,
          awaySuccess
        } = data;
        setTileData({
          gamesPlayed,
          bogeyRoundNumber,
          mostSelected,
          mostSuccessful,
          leastSuccessful,
          bogeyTeam,
          homeSuccess,
          awaySuccess
        });
      }
      setIsLoadingTileData(false);
    };

    if (session) {
      fetchData();
    }
  }, [session, refreshTrigger]);

  return { data: tileData, isLoading: isLoadingTileData };
};

export default useTileData;
