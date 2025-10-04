'use client';

import { useState } from 'react';
import TileWrapper from '@/components/ui/tiles';
import CurrentGameResults from './current-game-results';
import FixturesResults from './fixtures-results';
import Predictions from './predictions';
import LeagueTable from './league-table';
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

export type TeamsArr = {
  id: number;
  name: FPLTeamName;
  short_name: string;
}[];

const Page = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: session } = useSession();
  const { results, isLoadingResults } = useResults({ refreshTrigger });

  const { fixtures, isLoadingFixtures } = useFixtures();
  const { fplData, isLoadingFplData } = useFplData();
  const { leagueName, isLoadingLeagueName } = useLeagueInfo();

  const currentGwNumber =
    !isLoadingFplData && fplData
      ? fplData.events.find((obj) => obj.is_current === true)?.id || MIN_GW
      : MIN_GW;

  const predictionWeekFixtures = fixtures?.filter(
    (fixture) => fixture.event === currentGwNumber + 1
  );

  const teamsArr: TeamsArr =
    !isLoadingFplData && fplData
      ? fplData.teams.map(({ id, name, short_name }) => ({
          id,
          name,
          short_name
        }))
      : [];

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
      <div className="rounded-xl bg-gray-300 p-4 shadow-sm grid col-span-2 md:col-span-1 my-4">
        <h1 className="text-4xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          LPSIQ
        </h1>

        <p className="rounded-xl px-4 py-4 text-center text-xl font-light italic">
          <strong className="font-bold">Submit predictions</strong>,{' '}
          <strong className="font-bold">plan picks</strong>,{' '}
          <strong className="font-bold">view results</strong>, and{' '}
          <strong className="font-bold">analyse performance</strong>.
        </p>
      </div>

      {session === null || session === undefined ? (
        ''
      ) : (
        <TileWrapper refreshTrigger={refreshTrigger} />
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <div className="my-8 md:mr-3 w-full md:my-0 grid md:col-span-3">
          <CurrentGameResults
            refreshTrigger={refreshTrigger}
            leagueName={leagueName}
            isLoading={isLoadingLeagueName}
          />
        </div>

        <div className="my-8 w-full md:my-0 md:col-span-1">
          <Predictions
            session={session}
            teamsArr={teamsArr}
            results={results}
            predictionWeekFixtures={predictionWeekFixtures}
            setRefreshTrigger={setRefreshTrigger}
            isLoading={isLoadingResults || isLoadingResults || isLoadingFplData}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <div className="my-8 md:mr-3 w-full md:my-0 grid md:col-span-2">
          <FixturesResults
            fixtures={fixtures}
            currentGwNumber={currentGwNumber}
            teamsArr={teamsArr}
            isLoading={isLoadingFixtures}
          />
        </div>

        <div className="my-8 w-full md:my-0 md:col-span-2">
          <LeagueTable
            fixtures={fixtures}
            isLoading={isLoadingFixtures}
            teamsArr={teamsArr}
          />
        </div>
      </div>

      <Card className="rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto md:hidden">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>View your previous results</CardDescription>
        </CardHeader>

        <CardContent>
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
