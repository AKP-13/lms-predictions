'use client';

import { useEffect, useMemo, useState } from 'react';
import TileWrapper from '@/components/ui/tiles';
import CurrentGame from './current-game-results';
import FixturesResults from './fixtures-results';
import Predictions from './predictions';
import LeagueTable from './league-table';
import PickPlanner from '@/components/PickPlanner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TeamName,
  TeamScore
} from '@/components/ui/table';
import { MIN_GW } from '@/lib/constants';
import { FPLTeamName } from '@/lib/definitions';
import { useSession } from 'next-auth/react';
import useResults from 'app/hooks/useResults';
import useFixtures from 'app/hooks/useFixtures';
import useFplData from 'app/hooks/useFplData';
import useLeagueInfo from 'app/hooks/useLeagueInfo';
import useCurrentGameData from 'app/hooks/useCurrentGameData';

export type TeamsArr = {
  id: number;
  name: FPLTeamName;
  short_name: string;
}[];

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
  const { results, isLoadingResults } = useResults({ refreshTrigger });

  const { fixtures, isLoadingFixtures } = useFixtures();
  const { fplData, isLoadingFplData } = useFplData();
  const { leagueName, isLoadingLeagueName } = useLeagueInfo();
  const { currentGameResults, currentGameId, isLoadingCurrentGameData } =
    useCurrentGameData({ refreshTrigger });

  const currentGwNumber =
    !isLoadingFplData && fplData
      ? fplData.events.find((obj) => obj.is_current === true)?.id || MIN_GW
      : MIN_GW;

  const predictionWeekFixtures = fixtures?.filter(
    (fixture) => fixture.event === currentGwNumber + 1
  );

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

  const maxGameWeeks = isLoadingResults
    ? 1
    : Array.isArray(Object.values(results))
      ? Object.values(results).reduce(
          (maxLength, currentArray) => Math.max(maxLength, currentArray.length),
          0
        )
      : 1;

  return (
    <main>
      <div className="rounded-2xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-8 md:p-12 shadow-lg grid col-span-2 md:col-span-1 my-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4 flex items-center justify-center gap-2 tracking-tight">
          Last Player Standing
        </h1>

        <p className="rounded-xl px-4 py-2 text-center text-lg md:text-xl font-normal text-gray-700 leading-relaxed">
          <strong className="font-semibold text-gray-900">Submit predictions</strong>,{' '}
          <strong className="font-semibold text-gray-900">plan picks</strong>,{' '}
          <strong className="font-semibold text-gray-900">view results</strong>, and{' '}
          <strong className="font-semibold text-gray-900">analyse performance</strong>.
        </p>
      </div>

      {session === null || session === undefined ? null : (
        <div className="my-8">
          <TileWrapper refreshTrigger={refreshTrigger} />
        </div>
      )}

      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-4 my-8">
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
            setRefreshTrigger={setRefreshTrigger}
            isLoading={isLoadingResults || isLoadingFplData}
            currentGameId={currentGameId}
          />
        </div>
      </div>

      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-4 my-8">
        <div className="w-full grid md:col-span-2">
          <FixturesResults
            fixtures={fixtures}
            currentGwNumber={currentGwNumber}
            teamsArr={teamsArr}
            isLoading={isLoadingFixtures}
          />
        </div>

        <div className="w-full md:col-span-2">
          <LeagueTable
            fixtures={fixtures}
            isLoading={isLoadingFixtures}
            teamsArr={teamsArr}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto my-8">
        <PickPlanner
          teams={teamsArr}
          fixtures={fixtures || []}
          currentGwNumber={currentGwNumber}
          numWeeks={numWeeks}
          setNumWeeks={setNumWeeks}
          results={results || {}}
          session={session}
          currentGameId={currentGameId}
        />
      </div>

      <Card className="rounded-2xl bg-white p-3 md:p-4 my-8 shadow-md overflow-auto md:hidden">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-2xl md:text-3xl">Results</CardTitle>
          <CardDescription className="text-base text-gray-600">View your previous results</CardDescription>
        </CardHeader>

        <CardContent className="p-3 md:p-6 md:pt-0">
          {session === null ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                style={{ color: 'blue', fontWeight: 600, textAlign: 'center' }}
                href="/api/auth/signin"
              >
                Sign in to get started
              </a>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  {Array.from(Array(maxGameWeeks)).map((_, gameWeek) => (
                    <TableHead
                      key={`gw-headcell-${gameWeek + 1}`}
                    >{`Round ${gameWeek + 1}`}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(results).map((gameResults, gameIdx) => (
                  <TableRow key={`game-row-${gameResults[0].game_id}`}>
                    <TableCell className="font-medium">{gameIdx + 1}</TableCell>
                    {gameResults.map((prediction, predictionIdx) => (
                      <TableCell
                        key={`gw-cell-${gameIdx}-${predictionIdx}`}
                        className={`table-cell ${prediction.correct ? 'bg-green-200' : 'bg-red-200'}`}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            textAlign: 'center'
                          }}
                        >
                          <div>
                            <TeamName location="Home" prediction={prediction} />{' '}
                            v{' '}
                            <TeamName location="Away" prediction={prediction} />
                          </div>
                          <div>
                            <TeamScore
                              location="Home"
                              prediction={prediction}
                            />{' '}
                            <span className="font-thin">v</span>{' '}
                            <TeamScore
                              location="Away"
                              prediction={prediction}
                            />
                          </div>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Page;
