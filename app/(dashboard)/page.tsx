'use client';

import { useEffect, useMemo, useState } from 'react';
import TileWrapper from '@/components/ui/tiles';
import CurrentGame from './current-game-results';
import FixturesResults from './fixtures-results';
import Predictions from './predictions';
import LeagueTable from './league-table';
import PickPlanner from '@/components/PickPlanner';
import { FPLTeamName, Injury, TeamsArr } from '@/lib/definitions';
import {
  resolvePredictionGameweek,
  resolveResultsGameweek,
  returnIsPastSubmissionDeadline
} from '@/lib/gameweek';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import useResults from 'app/hooks/useResults';
import useFixtures from 'app/hooks/useFixtures';
import useFplData, { FplData } from 'app/hooks/useFplData';
import useLeagueInfo from 'app/hooks/useLeagueInfo';
import useCurrentGameData from 'app/hooks/useCurrentGameData';
import Injuries from './injuries';
import { HomeTabs, type HomeTab } from './home-tabs';

const Page = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [numWeeks, setNumWeeks] = useState<number>(() => {
    try {
      const v =
        typeof window !== 'undefined'
          ? localStorage.getItem('pickPlanner:numWeeks')
          : null;
      return v ? Number(v) : 5;
    } catch {
      return 5;
    }
  });

  // persist selection
  useEffect(() => {
    try {
      localStorage.setItem('pickPlanner:numWeeks', String(numWeeks));
    } catch {
      // ignore
    }
  }, [numWeeks]);

  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // A push, not a replace, so the back button returns to the previous tab.
  const changeTab = (tab: HomeTab) => {
    const params = new URLSearchParams(searchParams);
    if (tab === 'this-week') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const query = params.toString();
    window.history.pushState(
      null,
      '',
      query ? `?${query}` : window.location.pathname
    );
  };
  const { results, isLoadingResults } = useResults({ refreshTrigger });

  const { fixtures, isLoadingFixtures } = useFixtures();
  const { fplData, isLoadingFplData } = useFplData();
  const { leagueName, isLoadingLeagueName } = useLeagueInfo();
  const { currentGameResults, currentGameId, isLoadingCurrentGameData } =
    useCurrentGameData({ refreshTrigger });

  const gameweekEvents = !isLoadingFplData && fplData ? fplData.events : null;

  // The gameweek players are picking for
  const predictionGwNumber = resolvePredictionGameweek(gameweekEvents);
  // The most recent started gameweek, for the Fixtures panel
  const resultsGwNumber = resolveResultsGameweek(gameweekEvents);

  const predictionWeekFixtures =
    predictionGwNumber === null
      ? []
      : fixtures.filter((fixture) => fixture.event === predictionGwNumber);

  const isPastSubmissionDeadline = returnIsPastSubmissionDeadline({
    predictionWeekFixtures
  });

  const teamsArr: TeamsArr = useMemo(
    () =>
      !isLoadingFplData && fplData
        ? fplData.teams.map(({ id, name, short_name }) => ({
            id,
            name,
            short_name
          }))
        : [],
    [isLoadingFplData, fplData]
  );

  const injuries: Injury[] =
    fplData?.elements?.reduce<
      {
        web_name: string;
        chance_of_playing_next_round: number | null;
        news: string;
        team_name: FPLTeamName | null;
      }[]
    >((acc, curr) => {
      if (curr.status === 'i') {
        acc.push({
          web_name: curr.web_name,
          chance_of_playing_next_round: curr.chance_of_playing_next_round,
          news: curr.news,
          team_name:
            fplData?.teams.find((team) => team.id === curr.team)?.name || null
        });
      }
      return acc;
    }, []) ?? [];

  return (
    <main>
      <div className="rounded-xl bg-gray-300 p-4 shadow-sm grid col-span-2 md:col-span-1 my-6">
        <h1 className="text-4xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          Last Player Standing
        </h1>

        <p className="rounded-xl px-4 py-4 text-center text-xl font-light italic">
          <strong className="font-bold">Submit predictions</strong>,{' '}
          <strong className="font-bold">plan picks</strong>,{' '}
          <strong className="font-bold">view results</strong>, and{' '}
          <strong className="font-bold">analyse performance</strong>.
        </p>
      </div>

      <HomeTabs
        tab={searchParams.get('tab')}
        onTabChange={changeTab}
        thisWeek={
          <>
            {session === null || session === undefined ? null : (
              <div className="my-6">
                <TileWrapper refreshTrigger={refreshTrigger} />
              </div>
            )}

            <div className="grid gap-6 grid-cols-1 md:grid-cols-4 my-6">
              <div className="w-full grid md:col-span-3">
                <CurrentGame
                  currentGameResults={currentGameResults}
                  leagueName={leagueName}
                  isLoading={isLoadingLeagueName || isLoadingCurrentGameData}
                />
              </div>

              <div className="w-full md:col-span-1">
                <Predictions
                  session={session}
                  teamsArr={teamsArr}
                  results={results}
                  predictionWeekFixtures={predictionWeekFixtures}
                  predictionGwNumber={predictionGwNumber}
                  isPastSubmissionDeadline={isPastSubmissionDeadline}
                  setRefreshTrigger={setRefreshTrigger}
                  isLoading={
                    isLoadingResults || isLoadingFplData || isLoadingFixtures
                  }
                  currentGameId={currentGameId}
                />
              </div>
            </div>
          </>
        }
        fixtures={
          <FixturesResults
            fixtures={fixtures}
            currentGwNumber={resultsGwNumber}
            teamsArr={teamsArr}
            isLoading={isLoadingFixtures}
          />
        }
        injuries={<Injuries data={injuries} isLoading={isLoadingFplData} />}
        table={
          <LeagueTable
            fixtures={fixtures}
            isLoading={isLoadingFixtures}
            teamsArr={teamsArr}
          />
        }
        planner={
          <PickPlanner
            teams={teamsArr}
            fixtures={fixtures || []}
            predictionGwNumber={predictionGwNumber}
            isPastSubmissionDeadline={isPastSubmissionDeadline}
            numWeeks={numWeeks}
            setNumWeeks={setNumWeeks}
            results={results || {}}
            session={session}
            currentGameId={currentGameId}
          />
        }
      />
    </main>
  );
};

export default Page;
