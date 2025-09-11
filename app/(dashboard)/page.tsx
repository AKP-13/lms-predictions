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
import { auth } from '@/lib/auth';
import { MIN_GW } from '@/lib/constants';
import { FPLTeamName } from '@/lib/definitions';

export type TeamsArr = {
  id: number;
  name: FPLTeamName;
  short_name: string;
}[];

export const metadata: Metadata = {
  title: 'Dashboard'
};

type FormattedData = {
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
  teams: {
    code: number;
    draw: number;
    form: any;
    id: number;
    loss: number;
    name: FPLTeamName;
    played: number;
    points: number;
    position: number;
    pulse_id: number;
    short_name: string;
    strength: number;
    strength_attack_away: number;
    strength_attack_home: number;
    strength_defence_away: number;
    strength_defence_home: number;
    strength_overall_away: number;
    strength_overall_home: number;
    team_division: null;
    unavailable: boolean;
    win: number;
  }[];
  total_players: any;
};

export default async function Page() {
  const session = await auth();
  const results = await fetchResultsData({ userId: session?.user?.id });

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

  const formattedData: FormattedData = await overallData.json();

  const currentGwNumber =
    formattedData.events.find((obj) => obj.is_current === true)?.id || MIN_GW;

  const teamsArr: TeamsArr = formattedData.teams.map((team) => ({
    id: team.id,
    name: team.name,
    short_name: team.short_name
  }));

  const maxGameWeeks = Array.isArray(Object.values(results))
    ? Object.values(results).reduce(
        (maxLength, currentArray) => Math.max(maxLength, currentArray.length),
        0
      )
    : 1;

  return (
    <main>
      <div className="rounded-xl bg-gray-300 p-4 shadow-sm grid col-span-2 md:col-span-1 my-4">
        <h1 className="text-4xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          LMSIQ
        </h1>

        <p className="rounded-xl px-4 py-4 text-center text-xl font-light italic">
          The all-in-one LMS tool that allows you to{' '}
          <strong className="font-bold">submit LMS predictions</strong>,{' '}
          <strong className="font-bold">plan picks</strong>,{' '}
          <strong className="font-bold">view results</strong>, and{' '}
          <strong className="font-bold">analyse performance</strong>.
        </p>
      </div>

      {session === null ? '' : <TileWrapper />}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <div className="my-8 md:mr-3 w-full md:my-0 grid md:col-span-3">
          <CurrentGameResults />
        </div>

        <div className="my-8 w-full md:my-0 md:col-span-1">
          <Predictions teamsArr={teamsArr} results={results} />
        </div>
      </div>

      <div className="block md:flex">
        <div className="my-8 md:mr-3 w-full md:my-0">
          <FixturesResults
            fixtures={fixtures}
            currentGwNumber={currentGwNumber}
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
}
