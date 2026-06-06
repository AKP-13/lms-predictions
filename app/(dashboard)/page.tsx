'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WcPicksForm from './wc-picks-form';
import useWcFixtures from 'app/hooks/useWcFixtures';
import useWcPicks from 'app/hooks/useWcPicks';
import { WC_ROUND_DEADLINES, WC_ROUND_FIXTURE_LABELS } from '@/lib/wc-constants';

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
          <div className="flex flex-col gap-6 text-sm text-gray-700 leading-relaxed">

            {/* Badges + intro */}
            <Card className="rounded-xl bg-white shadow-sm">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-semibold">£10 entry</span>
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-white text-xs font-semibold">Winner takes all</span>
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-white text-xs font-semibold">11 rounds</span>
                </div>
                <p>
                  The game has two phases — a <strong>Last Player Standing group stage</strong> followed by a{' '}
                  <strong>points-based score prediction knockout stage</strong> (like Super 6). Here&apos;s how it works.
                </p>
              </CardContent>
            </Card>

            {/* Phase 1 */}
            <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="border-l-4 border-amber-400 px-6 py-4 bg-amber-50">
                <p className="text-xs font-bold tracking-widest text-amber-600 uppercase mb-0.5">Phase 1 · Rounds 1–6</p>
                <h3 className="text-lg font-bold text-gray-900">The Group Stage</h3>
              </div>
              <CardContent className="p-6 flex flex-col gap-4">
                <p>
                  The group stage is split into 6 rounds. Each round, pick a team to <strong>win</strong> from that round&apos;s fixtures. Incorrect prediction? Eliminated. Standard LPS stuff.
                </p>
                <p>
                  You can submit all 6 picks upfront and amend them right up to each round&apos;s deadline.
                </p>

                {/* Round table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide w-16">Round</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Fixtures</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6].map((r) => (
                        <tr key={r} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 font-semibold text-gray-800">{r}</td>
                          <td className="px-4 py-3 text-gray-700">{WC_ROUND_FIXTURE_LABELS[r]}</td>
                          <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">{formatDeadline(WC_ROUND_DEADLINES[r])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* No duplicate callout */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                  <p>
                    <strong className="text-amber-800">No duplicate teams:</strong>{' '}
                    <span className="text-amber-700">you can&apos;t pick the same team more than once across your 6 group stage picks.</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="border-l-4 border-green-500 px-6 py-4 bg-green-50">
                <p className="text-xs font-bold tracking-widest text-green-600 uppercase mb-0.5">Phase 2 · Rounds 7–11</p>
                <h3 className="text-lg font-bold text-gray-900">The Knockout Stage</h3>
              </div>
              <CardContent className="p-6 flex flex-col gap-4">
                <p>
                  Survive the group stage and you&apos;re into the knockout phase. Everyone still in predicts the score of the <strong>same match</strong> each round — the last fixture played in that round. No team restrictions apply; you can pick freely. Points stack up and the highest total after The Final wins.
                </p>

                {/* Points cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">5 pts</p>
                    <p className="text-xs text-green-600 mt-0.5">Correct score</p>
                  </div>
                  <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-700">2 pts</p>
                    <p className="text-xs text-amber-600 mt-0.5">Correct result</p>
                  </div>
                </div>

                {/* Knockout round table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide w-16">Round</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Fixtures</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[7, 8, 9, 10, 11].map((r) => (
                        <tr key={r} className={`border-b border-gray-100 last:border-0 ${r === 11 ? 'bg-amber-50' : ''}`}>
                          <td className={`px-4 py-3 font-semibold ${r === 11 ? 'text-amber-700' : 'text-gray-800'}`}>{r}</td>
                          <td className={`px-4 py-3 ${r === 11 ? 'font-semibold text-amber-700' : 'text-gray-700'}`}>{WC_ROUND_FIXTURE_LABELS[r]}</td>
                          <td className={`px-4 py-3 text-right whitespace-nowrap ${r === 11 ? 'text-amber-600' : 'text-gray-500'}`}>{formatDeadline(WC_ROUND_DEADLINES[r])}</td>
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
        </TabsContent>

        {/* ── Knockout tab ───────────────────────────────────────────────── */}
        <TabsContent value="knockout">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <p className="text-4xl">🏆</p>
              <p className="text-lg font-semibold text-gray-800">Knockout stage — coming soon</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Everyone who survives the group stage will predict the score of the same match each round — the last fixture played in that round. 5 points for a correct score, 2 for the correct result. The highest points total after The Final wins.
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Check back after 27 June when the group stage is complete.
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
