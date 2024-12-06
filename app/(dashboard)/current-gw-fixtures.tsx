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
  TableRow
} from '@/components/ui/table';
import { TeamName } from './predictions';

type Team = {
  code: number;
  draw: number;
  form: null;
  id: number;
  loss: number;
  name: TeamName;
  played: number;
  points: number;
  position: number;
  short_name: string;
  strength: number;
  team_division: null;
  unavailable: boolean;
  win: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  pulse_id: number;
};

type StatsObj = {
  value: number;
  element: number;
};

type FixturesData = {
  code: number;
  event: number;
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: string;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number;
  team_h: number;
  team_h_score: number;
  stats: (
    | {
        identifier: 'goals_scored';
        a: [];
        h: StatsObj[];
      }
    | {
        identifier: 'assists';
        a: [];
        h: StatsObj[];
      }
    | {
        identifier: 'own_goals';
        a: StatsObj[];
        h: StatsObj[];
      }
    | {
        identifier: 'penalties_saved';
        a: StatsObj[];
        h: StatsObj[];
      }
    | {
        identifier: 'penalties_missed';
        a: StatsObj[];
        h: StatsObj[];
      }
    | {
        identifier: 'yellow_cards';
        a: StatsObj[];
        h: StatsObj[];
      }
    | {
        identifier: 'red_cards';
        a: StatsObj[];
        h: StatsObj[];
      }
    | {
        identifier: 'saves';
        a: StatsObj[];
        h: StatsObj[];
      }
    | {
        identifier: 'bonus';
        a: [];
        h: StatsObj[];
      }
    | {
        identifier: 'bps';
        a: StatsObj[];
        h: StatsObj[];
      }
  )[];
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
};

type ChipName = 'bboost' | 'freehit' | 'wildcard' | '3xc';

type ChipPlay = {
  chip_name: ChipName;
  num_played: number;
};

type ThisGw = {
  id: number;
  name: string;
  deadline_time: string;
  release_time: null;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  cup_leagues_created: boolean;
  h2h_ko_matches_created: boolean;
  ranked_count: number;
  chip_plays: ChipPlay[];
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
};

const CurrentGwFixtures = async () => {
  const overallData = await fetch(
    'https://fantasy.premierleague.com/api/bootstrap-static/'
  );
  const formattedData = await overallData.json();

  const fixturesData = await fetch(
    'https://fantasy.premierleague.com/api/fixtures'
  );
  const formattedFixturesData: FixturesData[] = await fixturesData.json();

  const teamsArr = formattedData.teams.map((team: Team) => ({
    id: team.id,
    name: team.name,
    short_name: team.short_name
  }));

  const thisGw: ThisGw = formattedData.events.find(
    (gwObj: any) => gwObj.is_next === true
  );

  const thisGwFixtures = formattedFixturesData.filter(
    (fixtureObj) => fixtureObj.event === thisGw.id
  );

  const firstFiveFixtures = thisGwFixtures.slice(0, 5);
  const secondFiveFixtures = thisGwFixtures.slice(5, 10);

  return (
    <Card className="rounded-xl bg-white p-2 shadow-sm ">
      <CardHeader>
        <CardTitle>Fixtures</CardTitle>
        <CardDescription>The fixtures for this round</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{thisGw.name}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {firstFiveFixtures.map((fixture, idx) => (
              <TableRow key={fixture.code}>
                <TableCell className="table-cell">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'center'
                    }}
                  >
                    <span>
                      {teamsArr[fixture.team_h - 1].name} v{' '}
                      {teamsArr[fixture.team_a - 1].name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="table-cell">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'center'
                    }}
                  >
                    <span>
                      {teamsArr[secondFiveFixtures[idx].team_h - 1].name} v{' '}
                      {teamsArr[secondFiveFixtures[idx].team_a - 1].name}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CurrentGwFixtures;
