'use client';

// ─── World Cup 2026 ───────────────────────────────────────────────────────────
import WcPicksForm from './wc-picks-form';

// ─── FPL Last Player Standing (commented out for WC summer) ──────────────────
// import { useEffect, useMemo, useState } from 'react';
// import TileWrapper from '@/components/ui/tiles';
// import CurrentGame from './current-game-results';
// import FixturesResults from './fixtures-results';
// import Predictions from './predictions';
// import LeagueTable from './league-table';
// import PickPlanner from '@/components/PickPlanner';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TeamName,
//   TeamScore
// } from '@/components/ui/table';
// import { MIN_GW } from '@/lib/constants';
// import { FPLTeamName, Injury } from '@/lib/definitions';
// import { useSession } from 'next-auth/react';
// import useResults from 'app/hooks/useResults';
// import useFixtures from 'app/hooks/useFixtures';
// import useFplData, { FplData } from 'app/hooks/useFplData';
// import useLeagueInfo from 'app/hooks/useLeagueInfo';
// import useCurrentGameData from 'app/hooks/useCurrentGameData';
// import Injuries from './injuries';

// export type TeamsArr = {
//   id: number;
//   name: FPLTeamName;
//   short_name: string;
// }[];

const Page = () => {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-gray-300 p-4 shadow-sm my-6">
        <h1 className="text-4xl font-bold text-center mb-2">
          ⚽ World Cup 2026
        </h1>
        <p className="text-center text-xl font-light italic px-4 py-2">
          Last Player Standing — pick a team to win each round. Use the same
          team twice and you&apos;re out.
        </p>
      </div>

      {/* ── Picks form ───────────────────────────────────────────────────── */}
      <WcPicksForm />

      {/* ── FPL dashboard (commented out for the summer) ─────────────────── */}
      {/* const [refreshTrigger, setRefreshTrigger] = useState(0);                */}
      {/* ... restore by uncommenting the imports above and the block below ...   */}
      {/*
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
            setRefreshTrigger={setRefreshTrigger}
            isLoading={isLoadingResults || isLoadingFplData}
            currentGameId={currentGameId}
          />
        </div>
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4 my-6">
        <div className="w-full md:col-span-2 relative">
          <div className="flex flex-col gap-6 md:absolute md:inset-0">
            <FixturesResults
              fixtures={fixtures}
              currentGwNumber={currentGwNumber}
              teamsArr={teamsArr}
              isLoading={isLoadingFixtures}
            />
            <div className="flex-1 min-h-0 flex flex-col">
              <Injuries data={injuries} isLoading={isLoadingFplData} />
            </div>
          </div>
        </div>
        <div className="w-full md:col-span-2">
          <LeagueTable
            fixtures={fixtures}
            isLoading={isLoadingFixtures}
            teamsArr={teamsArr}
          />
        </div>
      </div>
      <div className="w-full overflow-x-auto my-6">
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
      <Card className="rounded-xl bg-white p-2 my-6 shadow-sm overflow-auto md:hidden">
        <CardHeader className="p-2 md:p-6">
          <CardTitle>Results</CardTitle>
          <CardDescription>View your previous results</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 md:pt-0">
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
                    <TableHead key={`gw-headcell-${gameWeek + 1}`}>
                      {`Round ${gameWeek + 1}`}
                    </TableHead>
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
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                          <div>
                            <TeamName location="Home" prediction={prediction} /> v{' '}
                            <TeamName location="Away" prediction={prediction} />
                          </div>
                          <div>
                            <TeamScore location="Home" prediction={prediction} />{' '}
                            <span className="font-thin">v</span>{' '}
                            <TeamScore location="Away" prediction={prediction} />
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
      */}
    </main>
  );
};

export default Page;
