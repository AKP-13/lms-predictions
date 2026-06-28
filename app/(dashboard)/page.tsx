'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import WcPicksForm from './wc-picks-form';
import KnockoutPicksForm from './knockout-picks-form';
import GameSelector from './game-selector';
import useWcFixtures from 'app/hooks/useWcFixtures';
import useWcPicks from 'app/hooks/useWcPicks';
import useWcLeagues from 'app/hooks/useWcLeagues';
import useWcKnockoutFixtures from 'app/hooks/useWcKnockoutFixtures';
import useWcKnockoutPicks from 'app/hooks/useWcKnockoutPicks';
import {
  WC_ROUND_DEADLINES,
  WC_ROUND_FIXTURE_LABELS
} from '@/lib/wc-constants';

// ─── FPL Last Player Standing (commented out for WC summer) ──────────────────
// import { useEffect, useMemo, useState } from 'react';
// import TileWrapper from '@/components/ui/tiles';
// import CurrentGame from './current-game-results';
// import FixturesResults from './fixtures-results';
// import Predictions from './predictions';
// import LeagueTable from './league-table';
// import PickPlanner from '@/components/PickPlanner';
// import {
//   CardDescription,
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

function formatDeadline(date: Date): string {
  return date.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function SignInCard() {
  const { data: session, status } = useSession();

  if (status === 'loading' || session) return null;

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardContent className="p-6 flex flex-col gap-4">
        <div>
          <p className="font-semibold text-gray-900">Want to play?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sign in with your email — we&apos;ll send you a magic link.
          </p>
        </div>
        <Button asChild>
          <a href="/api/auth/signin">Sign in</a>
        </Button>
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to the{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            privacy policy
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}

const Page = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { wcFixtures, isLoadingWcFixtures } = useWcFixtures();
  const { wcPicks, isLoadingWcPicks } = useWcPicks({ refreshTrigger });
  const { wcLeagues } = useWcLeagues();

  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  const { wcKnockoutFixtures, isLoadingWcKnockoutFixtures } =
    useWcKnockoutFixtures();
  const { wcKnockoutPicks, isLoadingWcKnockoutPicks } = useWcKnockoutPicks({
    leagueId: selectedLeagueId,
    refreshTrigger
  });

  // Default to the user's active game: survivors → Game 1, everyone else → Game 2.
  useEffect(() => {
    if (selectedLeagueId !== null || wcLeagues.length === 0) return;
    const eligible = wcLeagues.filter((l) => l.eligible);
    const primary =
      eligible.find((l) => !l.knockout_only) ?? eligible[0] ?? wcLeagues[0];
    setSelectedLeagueId(primary.league_id);
  }, [wcLeagues, selectedLeagueId]);

  const selectedLeague =
    wcLeagues.find((l) => l.league_id === selectedLeagueId) ?? null;
  const knockoutOnly = selectedLeague?.knockout_only ?? false;

  // The group stage belongs to the original game only — leave that tab if a
  // knockout-only game becomes selected.
  useEffect(() => {
    if (knockoutOnly && activeTab === 'group-stage') setActiveTab('rules');
  }, [knockoutOnly, activeTab]);

  // Amber dot: any open round (deadline not passed) has no saved pick
  const now = new Date();
  const showGroupStageIndicator =
    !knockoutOnly &&
    !isLoadingWcPicks &&
    [1, 2, 3, 4, 5, 6].some(
      (r) =>
        now < WC_ROUND_DEADLINES[r] &&
        !wcPicks.some((p) => p.round_number === r)
    );

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-gray-300 p-4 shadow-sm my-6">
        <h1 className="text-4xl font-bold text-center mb-2">
          ⚽ World Cup 2026
        </h1>
        <p className="text-center text-xl font-light italic px-4 py-2">
          Survive the group stage then accumulate the most points to win.
        </p>
        <GameSelector
          leagues={wcLeagues}
          selectedLeagueId={selectedLeagueId}
          onSelect={setSelectedLeagueId}
        />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="rules" className="flex-1">
            Rules
          </TabsTrigger>
          {!knockoutOnly && (
            <TabsTrigger value="group-stage" className="flex-1">
              Group Stage
              {showGroupStageIndicator && (
                <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-400 inline-block" />
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="knockout" className="flex-1">
            Knockout
          </TabsTrigger>
        </TabsList>

        {/* ── Rules tab ──────────────────────────────────────────────────── */}
        <TabsContent value="rules">
          <div className="flex flex-col gap-6 text-sm text-gray-700 leading-relaxed">
            {/* Sign-in CTA — only shown to guests */}
            <SignInCard />

            {/* Badges + intro */}
            <Card className="rounded-xl bg-white shadow-sm">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-semibold">
                    £10 entry
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-white text-xs font-semibold">
                    Winner takes all
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-white text-xs font-semibold">
                    11 rounds
                  </span>
                </div>
                <p>The game has two phases:</p>
                <ol className="flex flex-col gap-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-gray-400 shrink-0 w-4">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Group Stage — Last Player Standing style
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Predict 6 teams to win, incorrect prediction?
                        You&apos;re eliminated. Standard LPS stuff.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-gray-400 shrink-0 w-4">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Knockout Stage — Score Prediction
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Predict the score of predefined knockout stage matches.
                        Earn 5 points for the correct score and 2 points for the
                        correct outcome. Highest points total after The Final
                        wins the pot!
                      </p>
                    </div>
                  </li>
                </ol>
                <p className="text-muted-foreground text-xs">
                  Details below...
                </p>
              </CardContent>
            </Card>

            {/* Phase 1 */}
            <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="border-l-4 border-amber-400 px-6 py-4 bg-amber-50">
                <p className="text-xs font-bold tracking-widest text-amber-600 uppercase mb-0.5">
                  Phase 1 · Rounds 1–6
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  The Group Stage
                </h3>
                <button
                  onClick={() => setActiveTab('group-stage')}
                  className="mt-2 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
                >
                  Submit your predictions →
                </button>
              </div>
              <CardContent className="p-6 flex flex-col gap-4">
                <p>
                  The group stage is split into 6 rounds. Each round, pick a
                  team to <strong>win</strong> from that round&apos;s fixtures.
                  Incorrect prediction? Eliminated. Standard LPS stuff.
                </p>
                <p className="text-muted-foreground">
                  You can submit all 6 picks upfront and amend them right up to
                  each round&apos;s deadline.
                </p>

                {/* Round table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide w-16">
                          Round
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">
                          Fixtures
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">
                          Deadline
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6].map((r) => (
                        <tr
                          key={r}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {r}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {WC_ROUND_FIXTURE_LABELS[r]}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                            {formatDeadline(WC_ROUND_DEADLINES[r])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* No duplicate callout */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                  <p>
                    <strong className="text-amber-800">
                      No duplicate teams:
                    </strong>{' '}
                    <span className="text-amber-700">
                      you can&apos;t pick the same team more than once across
                      your 6 group stage picks.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="border-l-4 border-green-500 px-6 py-4 bg-green-50">
                <p className="text-xs font-bold tracking-widest text-green-600 uppercase mb-0.5">
                  Phase 2 · Rounds 7–11
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  The Knockout Stage
                </h3>
              </div>
              <CardContent className="p-6 flex flex-col gap-4">
                <p>
                  Survive the group stage and you&apos;re in with a shot at
                  winning. Each knockout round, everyone predicts the score of
                  the same match. Points accumulate and the highest total after
                  The Final takes the pot.
                </p>

                {/* Points cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">5 pts</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Correct score
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-700">2 pts</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Correct result
                    </p>
                  </div>
                </div>

                {/* Knockout round table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide w-16">
                          Round
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">
                          Fixtures
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">
                          Deadline
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[7, 8, 9, 10, 11].map((r) => (
                        <tr
                          key={r}
                          className={`border-b border-gray-100 last:border-0 ${r === 11 ? 'bg-amber-50' : ''}`}
                        >
                          <td
                            className={`px-4 py-3 font-semibold ${r === 11 ? 'text-amber-700' : 'text-gray-800'}`}
                          >
                            {r}
                          </td>
                          <td
                            className={`px-4 py-3 ${r === 11 ? 'font-semibold text-amber-700' : 'text-gray-700'}`}
                          >
                            {WC_ROUND_FIXTURE_LABELS[r]}
                          </td>
                          <td
                            className={`px-4 py-3 text-right whitespace-nowrap ${r === 11 ? 'text-amber-600' : 'text-gray-500'}`}
                          >
                            {formatDeadline(WC_ROUND_DEADLINES[r])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Group Stage tab ────────────────────────────────────────────── */}
        <TabsContent value="group-stage">
          <WcPicksForm
            wcPicks={wcPicks}
            isLoadingWcPicks={isLoadingWcPicks}
            wcFixtures={wcFixtures}
            isLoadingWcFixtures={isLoadingWcFixtures}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
          <p className="text-xs text-muted-foreground text-center mt-4">
            Probabilities are from Opta
          </p>
        </TabsContent>

        {/* ── Knockout tab ───────────────────────────────────────────────── */}
        <TabsContent value="knockout">
          <KnockoutPicksForm
            leagueId={selectedLeagueId}
            eligible={selectedLeague?.eligible ?? false}
            fixtures={wcKnockoutFixtures}
            isLoadingFixtures={isLoadingWcKnockoutFixtures}
            picks={wcKnockoutPicks}
            isLoadingPicks={isLoadingWcKnockoutPicks}
            setRefreshTrigger={setRefreshTrigger}
          />
        </TabsContent>
      </Tabs>

      {/* ── FPL dashboard (commented out for the summer) ─────────────────── */}
      {/* Restore by: uncommenting imports at the top, removing WC tabs above, */}
      {/* and uncommenting the block below.                                     */}
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
