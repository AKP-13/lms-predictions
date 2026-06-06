'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WcPicksForm from './wc-picks-form';
import useWcFixtures from 'app/hooks/useWcFixtures';
import useWcPicks from 'app/hooks/useWcPicks';
import { WC_ROUND_DEADLINES, WC_ROUND_LABELS } from '@/lib/wc-constants';

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

const Page = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { wcFixtures, isLoadingWcFixtures } = useWcFixtures();
  const { wcPicks, isLoadingWcPicks } = useWcPicks({ refreshTrigger });

  // Amber dot: any open round (deadline not passed) has no saved pick
  const now = new Date();
  const showGroupStageIndicator =
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
          Last Player Standing — pick a team to win each round. Use the same
          team twice and you&apos;re out.
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="rules" className="flex-1">
            Rules
          </TabsTrigger>
          <TabsTrigger value="group-stage" className="flex-1">
            Group Stage
            {showGroupStageIndicator && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-400 inline-block" />
            )}
          </TabsTrigger>
          <TabsTrigger value="knockout" className="flex-1">
            Knockout
          </TabsTrigger>
        </TabsList>

        {/* ── Rules tab ──────────────────────────────────────────────────── */}
        <TabsContent value="rules">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl">How to play</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 flex flex-col gap-6 text-sm text-gray-700 leading-relaxed">

              <section>
                <h3 className="font-semibold text-base text-gray-900 mb-2">The basics</h3>
                <p>
                  This is a <strong>Last Player Standing</strong> game for the World Cup 2026 group stage. There are <strong>6 rounds</strong>. Each round, you pick one team to <strong>win their match outright</strong> — draws don&apos;t count. Get it right and you survive; get it wrong and you&apos;re out.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base text-gray-900 mb-2">The no-repeat rule</h3>
                <p>
                  You <strong>cannot pick the same team twice</strong> across all 6 rounds. Once you&apos;ve used a team, they&apos;re gone from your options for the rest of the group stage. Choose wisely.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base text-gray-900 mb-2">How the rounds work</h3>
                <p className="mb-2">
                  The 6 rounds follow the group stage matchdays, alternating between two halves of the draw:
                </p>
                <ul className="flex flex-col gap-1 pl-1">
                  {[1, 2, 3, 4, 5, 6].map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <span className="font-semibold text-gray-500 shrink-0 w-5 text-right">{r}.</span>
                      <span>{WC_ROUND_LABELS[r]}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base text-gray-900 mb-2">Submitting your picks</h3>
                <p>
                  You can submit all 6 predictions upfront — you don&apos;t have to wait for each round to finish. You can also come back and change any pick up to the deadline for that round. Once the deadline passes, your pick is locked.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base text-gray-900 mb-2">Deadlines</h3>
                <ul className="flex flex-col gap-1 pl-1">
                  {[1, 2, 3, 4, 5, 6].map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <span className="font-semibold text-gray-500 shrink-0 w-5 text-right">{r}.</span>
                      <span>
                        <span className="font-medium">Round {r}:</span>{' '}
                        {formatDeadline(WC_ROUND_DEADLINES[r])}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base text-gray-900 mb-2">Knockout stage</h3>
                <p>
                  Players who survive all 6 group stage rounds advance to the knockout phase. That&apos;s a separate points-based game where everyone predicts the score of each knockout fixture — 5 points for the correct score, 2 points for the correct result. More details coming once the group stage is complete.
                </p>
              </section>

            </CardContent>
          </Card>
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
        </TabsContent>

        {/* ── Knockout tab ───────────────────────────────────────────────── */}
        <TabsContent value="knockout">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <p className="text-4xl">🏆</p>
              <p className="text-lg font-semibold text-gray-800">Knockout stage — coming soon</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Once the group stage is complete, surviving players will predict the scores of the knockout fixtures. Check back after 27 June.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── FPL dashboard (commented out for the summer) ─────────────────── */}
      {/* ... restore by uncommenting the imports at the top ...              */}
    </main>
  );
};

export default Page;
