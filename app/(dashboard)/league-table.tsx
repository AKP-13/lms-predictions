'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { FixturesData, FPLTeamName } from '@/lib/definitions';
import { TeamsArr } from './page';
import { CircleCheck, CircleMinus, CircleX, Loader } from 'lucide-react';

type LeagueTableRow = {
  position: number;
  teamId: number;
  teamName: FPLTeamName;
  teamNameShort: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDiff: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
};

const getPositionStyling = (position: number): string =>
  position === 1
    ? 'bg-blue-400'
    : position <= 4
      ? 'bg-blue-200'
      : position === 5
        ? 'bg-orange-200'
        : position >= 18
          ? 'bg-red-200'
          : '';

const returnFormColor = (result: 'W' | 'D' | 'L'): string =>
  result === 'W' ? '#4CAF50' : result === 'D' ? '#B0B0B0' : '#F44336';

const returnIcon = (result: 'W' | 'D' | 'L', color: string) => {
  return result === 'W' ? (
    <CircleCheck color={color} size={20} strokeWidth={0.75} />
  ) : result === 'D' ? (
    <CircleMinus color={color} size={20} strokeWidth={0.75} />
  ) : (
    <CircleX color={color} size={20} strokeWidth={1} />
  );
};

const buildLeagueTable = (
  fixtures: FixturesData[],
  teamsArr: TeamsArr
): LeagueTableRow[] => {
  // Initialize stats for each team
  const table: Record<
    number,
    Omit<LeagueTableRow, 'position' | 'teamName' | 'teamNameShort' | 'form'> & {
      form: ('W' | 'D' | 'L')[];
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
  const teamFixtures: Record<
    number,
    { result: 'W' | 'D' | 'L'; gw: number }[]
  > = {};
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
    teamNameShort: team.short_name,
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

const headerPaddingDesktop = 'px-2 py-1';
const headerPaddingMobile = 'px-1 py-1';
const bodyPadding = 'px-1 py-1 md:p-4';
const center = 'text-center';

const tableConfig = [
  {
    dataKey: 'position',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    loadingDivClassName: 'h-5 w-5'
  },
  {
    dataKey: 'teamNameShort',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Team',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-10'
  },
  {
    dataKey: 'teamName',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Team',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-24'
  },
  {
    dataKey: 'matchesPlayed',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Played',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'matchesPlayed',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Pd',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'wins',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Won',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'wins',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'W',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'draws',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Drawn',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'draws',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'D',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'losses',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Lost',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'losses',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'L',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'goalsScored',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Scored',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'goalsScored',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'GF',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'goalsConceded',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Conceded',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'goalsConceded',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'GA',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'goalDiff',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Goal Diff',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'goalDiff',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'GD',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-8'
  },
  {
    dataKey: 'points',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Points',
    isDisplayedOnDesktop: true,
    loadingDivClassName: 'h-5 w-10'
  },
  {
    dataKey: 'points',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Pts',
    isDisplayedOnMobile: true,
    loadingDivClassName: 'h-5 w-10'
  },
  {
    dataKey: 'form',
    headerClassName: `${center}`,
    bodyClassName: `${center} ${bodyPadding}`,
    label: 'Form',
    loadingDivClassName: 'flex gap-1 justify-center'
  }
];

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
      className={`rounded-xl bg-white p-2 shadow-sm ${isLoading ? 'animate-pulse' : ''}`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="flex flex-row items-center">
        <CardTitle>League Table</CardTitle>
        {isLoading && (
          <Loader className="animate-spin mx-2" aria-hidden="true" />
        )}
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {fixtures.length === 0 ? (
                <TableHead className="text-center">No data</TableHead>
              ) : (
                tableConfig.map((col) => (
                  <TableHead
                    key={`${col.dataKey} - ${col.label}`}
                    className={`${col.headerClassName} ${col.isDisplayedOnMobile ? `table-cell md:hidden ${headerPaddingMobile}` : col.isDisplayedOnDesktop ? `hidden md:table-cell ${headerPaddingDesktop}` : ''}`}
                  >
                    {col.label}
                  </TableHead>
                ))
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 20 }).map((_, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-gray-100 last:border-0 animate-pulse"
                >
                  {tableConfig.map((col) => {
                    return (
                      <TableCell
                        className={`${col.bodyClassName} ${col.isDisplayedOnMobile ? 'table-cell md:hidden' : col.isDisplayedOnDesktop ? 'hidden md:table-cell' : ''}`}
                        key={`${col.dataKey} - ${col.label}`}
                      >
                        {col.dataKey === 'form' ? (
                          <div className={col.loadingDivClassName}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-5 w-5 rounded-full bg-gray-200"
                              />
                            ))}
                          </div>
                        ) : (
                          <div
                            className={`mx-auto rounded bg-gray-200 ${col.loadingDivClassName}`}
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : fixtures.length === 0 ? (
              <TableRow>
                <TableCell className="table-cell w-full px-2 text-center">
                  The site is being updated. Please check back later.
                </TableCell>
              </TableRow>
            ) : (
              leagueTable.map((row) => {
                const color = getPositionStyling(row.position);

                return (
                  <TableRow
                    key={row.teamName}
                    className={`border-b border-gray-100 last:border-0 ${isLoading ? 'animate-pulse' : ''}`}
                  >
                    {tableConfig.map((col) => {
                      return (
                        <TableCell
                          className={`${col.bodyClassName} ${col.isDisplayedOnMobile ? 'table-cell md:hidden' : col.isDisplayedOnDesktop ? 'hidden md:table-cell' : ''} ${col.dataKey === 'position' ? color : ''}`}
                          key={`${col.dataKey} - ${col.label}`}
                        >
                          {col.dataKey === 'form' ? (
                            <div className="flex gap-1 justify-center">
                              {row.form.map((result, idx) => {
                                const color = returnFormColor(result);

                                const isMostRecent =
                                  idx === row.form.length - 1;
                                const icon = returnIcon(result, color);

                                return isMostRecent ? (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full border bg-white`}
                                    style={{
                                      borderColor: color
                                    }}
                                  >
                                    {icon}
                                  </span>
                                ) : (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center justify-center w-5 h-5"
                                  >
                                    {icon}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            row[col.dataKey as keyof LeagueTableRow]
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LeagueTable;
