'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormChips, type FormResult } from '@/components/TeamForm';
import { FixturesData, FPLTeamName } from '@/lib/definitions';
import { TeamsArr } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

type LeagueTableRow = {
  position: number;
  teamId: number;
  teamName: FPLTeamName;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDiff: number;
  points: number;
  form: FormResult[];
};

const buildLeagueTable = (
  fixtures: FixturesData[],
  teamsArr: TeamsArr
): LeagueTableRow[] => {
  // Initialize stats for each team
  const table: Record<
    number,
    Omit<LeagueTableRow, 'position' | 'teamName' | 'form'> & {
      form: FormResult[];
    }
  > = {};
  teamsArr.forEach((team) => {
    table[team.id] = {
      teamId: team.id,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
      goalDiff: 0,
      points: 0,
      form: []
    };
  });

  // Process each finished fixture
  // For form, collect all finished fixtures for each team
  const teamFixtures: Record<number, { result: FormResult; gw: number }[]> = {};
  teamsArr.forEach((team) => {
    teamFixtures[team.id] = [];
  });

  fixtures.forEach((fixture) => {
    if (!fixture.finished && !fixture.finished_provisional) return;

    const home = table[fixture.team_h];
    const away = table[fixture.team_a];

    if (home && away) {
      // Update matches played
      home.matchesPlayed += 1;
      away.matchesPlayed += 1;

      // Update goals scored/conceded
      home.goalsScored += fixture.team_h_score;
      home.goalsConceded += fixture.team_a_score;
      home.goalDiff += fixture.team_h_score - fixture.team_a_score;
      away.goalsScored += fixture.team_a_score;
      away.goalsConceded += fixture.team_h_score;
      away.goalDiff += fixture.team_a_score - fixture.team_h_score;

      // Determine result
      if (fixture.team_h_score > fixture.team_a_score) {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
        teamFixtures[fixture.team_h].push({ result: 'W', gw: fixture.event });
        teamFixtures[fixture.team_a].push({ result: 'L', gw: fixture.event });
      } else if (fixture.team_h_score < fixture.team_a_score) {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
        teamFixtures[fixture.team_h].push({ result: 'L', gw: fixture.event });
        teamFixtures[fixture.team_a].push({ result: 'W', gw: fixture.event });
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
        teamFixtures[fixture.team_h].push({ result: 'D', gw: fixture.event });
        teamFixtures[fixture.team_a].push({ result: 'D', gw: fixture.event });
      }
    }
  });

  // Convert to array and add team names
  const tableArr: LeagueTableRow[] = teamsArr.map((team) => ({
    position: 0, // will be set after sorting
    teamName: team.name,
    ...table[team.id],
    form: teamFixtures[team.id]
      .sort((a, b) => b.gw - a.gw) // most recent first
      .slice(0, 5)
      .map((f) => f.result)
      .reverse() // so oldest to newest (left to right)
  }));

  // Sort by points, then goal difference, then goals scored
  tableArr.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsScored - a.goalsScored;
  });

  // Assign positions
  tableArr.forEach((row, idx) => {
    row.position = idx + 1;
  });

  return tableArr;
};

const TOP_PLACES = 4;
const BOTTOM_PLACES = 3;

const NUMBER_CLASSES =
  'text-right text-sm font-semibold tabular-nums text-muted-foreground';

// "+7", "0" or "−3" with a true minus sign.
const formatGoalDiff = (goalDiff: number) =>
  goalDiff > 0 ? `+${goalDiff}` : goalDiff < 0 ? `−${-goalDiff}` : '0';

const PositionBadge = ({
  position,
  teamCount
}: {
  position: number;
  teamCount: number;
}) => (
  <span
    className={cn(
      'flex size-7 items-center justify-center rounded-full text-[0.8125rem] font-extrabold',
      position <= TOP_PLACES
        ? 'bg-accent-bg text-accent'
        : position > teamCount - BOTTOM_PLACES
          ? 'bg-destructive-bg text-destructive'
          : 'bg-chip'
    )}
  >
    {position}
  </span>
);

const LeagueTable = ({
  fixtures,
  isLoading,
  teamsArr
}: {
  fixtures: FixturesData[];
  isLoading: boolean;
  teamsArr: TeamsArr;
}) => {
  const leagueTable = buildLeagueTable(fixtures, teamsArr);

  return (
    <Card
      className={cn(isLoading && 'animate-pulse')}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="p-5 pb-1 md:p-6 md:pb-1">
        <CardTitle className="flex items-center gap-2">
          League Table
          {isLoading && (
            <Loader
              className="size-5 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
        {!isLoading && fixtures.length === 0 ? (
          <p className="pt-2 text-center text-muted-foreground">
            The site is being updated. Please check back later.
          </p>
        ) : (
          <table className="w-full table-fixed">
            <thead>
              <tr className="h-8 text-[0.8125rem] text-muted-foreground [&>th]:font-semibold">
                <th className="w-10">
                  <span className="sr-only">Position</span>
                </th>
                <th className="text-left">Team</th>
                <th className="w-9 text-right">
                  <abbr title="Played" className="no-underline">
                    P
                  </abbr>
                </th>
                <th className="w-11 text-right">
                  <abbr title="Goal difference" className="no-underline">
                    GD
                  </abbr>
                </th>
                <th className="w-11 text-right">
                  <abbr title="Points" className="no-underline">
                    Pts
                  </abbr>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 20 }).map((_, idx) => (
                    <tr key={idx} aria-hidden="true" className="h-14">
                      <td>
                        <div className="size-7 rounded-full bg-chip" />
                      </td>
                      <td>
                        <div className="h-4 w-28 rounded-full bg-chip" />
                        <div className="mt-1.5 h-5 w-28 rounded-md bg-chip" />
                      </td>
                      {[0, 1, 2].map((col) => (
                        <td key={col}>
                          <div className="ml-auto h-4 w-5 rounded-full bg-chip" />
                        </td>
                      ))}
                    </tr>
                  ))
                : leagueTable.map((row) => (
                    <tr key={row.teamName} className="h-14">
                      <td>
                        <PositionBadge
                          position={row.position}
                          teamCount={leagueTable.length}
                        />
                      </td>
                      <th scope="row" className="text-left font-normal">
                        <span className="block truncate text-[0.9375rem] font-bold leading-[1.375rem]">
                          {row.teamName}
                        </span>
                        <FormChips form={row.form} className="mt-1" />
                      </th>
                      <td className={NUMBER_CLASSES}>{row.matchesPlayed}</td>
                      <td className={NUMBER_CLASSES}>
                        {formatGoalDiff(row.goalDiff)}
                      </td>
                      <td
                        className={cn(
                          NUMBER_CLASSES,
                          'text-[0.9375rem] font-extrabold text-foreground'
                        )}
                      >
                        {row.points}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default LeagueTable;
