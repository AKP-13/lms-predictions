// import { Suspense } from "react";
// import { CardsSkeleton } from "@/app/ui/skeletons";
import { PartyPopper } from 'lucide-react';
import TileWrapper from '@/components/ui/tiles';
import { Metadata } from 'next';
import CurrentGameResults from './current-game-results';
import FixturesResults from './fixtures-results';
import Predictions from './predictions';
import { fetchResultsData } from '@/lib/data';
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

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function Page() {
  const results = await fetchResultsData();

  const fixturesData = await fetch(
    'https://fantasy.premierleague.com/api/fixtures'
  );

  const fixtures = await fixturesData.json();

  const overallData = await fetch(
    'https://fantasy.premierleague.com/api/bootstrap-static/',
    {
      cache: 'no-store',
      next: { revalidate: 0 }
    }
  );

  const formattedData: {
    chips: any;
    element_stats: any;
    element_types: any;
    elements: any;
    events: {
      id: number;
      name: string;
      deadline_time: string;
      release_time: null;
      average_entry_score: number;
      finished: boolean;
      data_checked: boolean;
      highest_scoring_entry: number;
      deadline_time_epoch: number;
      deadline_time_game_offset: 0;
      highest_score: number;
      is_previous: boolean;
      is_current: boolean;
      is_next: boolean;
      cup_leagues_created: boolean;
      h2h_ko_matches_created: boolean;
      can_enter: boolean;
      can_manage: boolean;
      released: boolean;
      ranked_count: number;
      overrides: {
        rules: {};
        scoring: {};
        element_types: [];
        pick_multiplier: null;
      };
      chip_plays: [
        {
          chip_name: 'bboost';
          num_played: number;
        },
        {
          chip_name: '3xc';
          num_played: number;
        }
      ];
      most_selected: number;
      most_transferred_in: number;
      top_element: number;
      top_element_info: {
        id: number;
        points: number;
      };
      transfers_made: number;
      most_captained: number;
      most_vice_captained: number;
    }[];
    game_config: any;
    game_settings: any;
    phases: any;
    teams: any;
    total_players: any;
  } = await overallData.json();

  console.log('formattedData', formattedData);

  const currentGwNumber =
    formattedData.events.find((obj) => obj.is_current === true)?.id || 0;

  const maxGameWeeks = Array.isArray(Object.values(results))
    ? Object.values(results).reduce(
        (maxLength, currentArray) => Math.max(maxLength, currentArray.length),
        0
      )
    : 1;

  return (
    <main>
      <div className="rounded-xl bg-gray-300 p-4 shadow-sm grid col-span-2 md:col-span-1 my-4">
        <p className="rounded-xl px-4 py-4 text-center text-xl font-light italic">
          The all-in-one LMS tool that allows you to{' '}
          <strong className="font-bold">submit LMS predictions</strong>,{' '}
          <strong className="font-bold">plan picks</strong>,{' '}
          <strong className="font-bold">view results</strong>, and{' '}
          <strong className="font-bold">analyse performance</strong>*.
        </p>
        <p className="hidden md:block rounded-xl px-4 py-0 text-center text-xs font-light italic">
          *Yes this is my actual data..don't judge my recent results in the
          Results tab too much!
        </p>
        <p className="block md:hidden rounded-xl px-4 py-4 text-center text-xs font-light italic">
          *Yes this is my actual data..don't judge my recent results at the
          bottom of this page too much!
        </p>
        <p className="rounded-xl text-center text-4xl italic font-bold  p-[4rem]">
          <a
            href="mailto:alexlmsapp@icloud.com?subject=Interested%20in%20LMS%20Predictions%20Tool&body=Hi%20Alex,%0D%0A%0D%0AI%20am%20interested%20in%20using%20your%20LMS%20Predictions%20Tool.%20Please%20provide%20more%20information.%0D%0A%0D%0AThank%20you!"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Join the waitlist!
          </a>
        </p>
      </div>
      {/* <Suspense fallback={<CardsSkeleton />}> */}
      <TileWrapper />
      {/* </Suspense> */}

      <CurrentGameResults />

      <div className="block md:flex">
        <div className="my-8 md:mr-3 w-full md:my-0">
          <FixturesResults
            fixtures={fixtures}
            currentGwNumber={currentGwNumber}
          />
        </div>

        <div className="my-8 md:ml-3 w-full md:my-0">
          <Predictions />
        </div>
      </div>

      <Card className="rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto md:hidden">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>View your previous results</CardDescription>
        </CardHeader>

        <CardContent>
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
        </CardContent>
      </Card>
    </main>
  );
}
