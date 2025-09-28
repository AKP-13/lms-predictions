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
  points: number;
  form: ('W' | 'D' | 'L')[];
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
    if (!fixture.finished) return;

    const home = table[fixture.team_h];
    const away = table[fixture.team_a];

    if (home && away) {
      // Update matches played
      home.matchesPlayed += 1;
      away.matchesPlayed += 1;

      // Update goals scored/conceded
      home.goalsScored += fixture.team_h_score;
      home.goalsConceded += fixture.team_a_score;
      away.goalsScored += fixture.team_a_score;
      away.goalsConceded += fixture.team_h_score;

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
    const gdA = a.goalsScored - a.goalsConceded;
    const gdB = b.goalsScored - b.goalsConceded;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsScored - a.goalsScored;
  });

  // Assign positions
  tableArr.forEach((row, idx) => {
    row.position = idx + 1;
  });

  return tableArr;
};

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
    >
      <CardHeader className="flex flex-row items-center">
        <CardTitle>League Table</CardTitle>
        {isLoading && <Loader className="animate-spin mx-2" />}
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center px-2 py-1" />
              <TableHead className="text-center px-2 py-1">Team</TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Played
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                Pd
              </TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Won
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                W
              </TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Drawn
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                D
              </TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Lost
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                L
              </TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Scored
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                GF
              </TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Conceded
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                GA
              </TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Goal Diff.
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                GD
              </TableHead>
              <TableHead className="hidden md:table-cell text-center px-2 py-1">
                Points
              </TableHead>
              <TableHead className="table-cell md:hidden text-center px-1 py-1">
                Pts
              </TableHead>
              <TableHead className="text-center px-2 py-1">Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 20 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-gray-100 last:border-0 animate-pulse"
                  >
                    {/* Position */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-5 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Team Short (mobile) */}
                    <TableCell className="table-cell md:hidden text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-10 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Team Name (desktop) */}
                    <TableCell className="hidden md:table-cell text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-24 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Played */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-8 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Won */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-8 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Drawn */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-8 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Lost */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-8 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Scored */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-8 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Conceded */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-8 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Goal Diff */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-10 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Points */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="h-5 w-10 mx-auto rounded bg-gray-200 shimmer" />
                    </TableCell>
                    {/* Form */}
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div className="flex gap-1 justify-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full bg-gray-200 shimmer"
                          />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : leagueTable.map((row) => (
                  <TableRow
                    key={row.teamName}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <TableCell
                      className={`text-center px-1 py-1 md:p-4 ${row.position === 1 ? 'bg-blue-400' : row.position <= 4 ? 'bg-blue-200' : row.position === 5 ? 'bg-orange-200' : row.position >= 18 ? 'bg-red-200' : ''}`}
                    >
                      {row.position}
                    </TableCell>
                    <TableCell className="table-cell md:hidden text-center px-1 py-1 md:p-4">
                      {row.teamNameShort}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center px-1 py-1 md:p-4">
                      {row.teamName}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.matchesPlayed}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.wins}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.draws}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.losses}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.goalsScored}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.goalsConceded}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.goalsScored - row.goalsConceded}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      {row.points}
                    </TableCell>
                    <TableCell className="text-center px-1 py-1 md:p-4">
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          justifyContent: 'center'
                        }}
                      >
                        {row.form.map((result, idx) => {
                          const color =
                            result === 'W'
                              ? '#4CAF50'
                              : result === 'D'
                                ? '#B0B0B0'
                                : '#F44336';
                          const isMostRecent = idx === row.form.length - 1;
                          const icon =
                            result === 'W' ? (
                              <CircleCheck
                                color={color}
                                size={20}
                                strokeWidth={0.75}
                              />
                            ) : result === 'D' ? (
                              <CircleMinus
                                color={color}
                                size={20}
                                strokeWidth={0.75}
                              />
                            ) : (
                              <CircleX
                                color={color}
                                size={20}
                                strokeWidth={1}
                              />
                            );
                          return isMostRecent ? (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                border: `1px solid ${color}`,
                                boxSizing: 'border-box',
                                background: '#fff'
                              }}
                            >
                              {icon}
                            </span>
                          ) : (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 20,
                                height: 20
                              }}
                            >
                              {icon}
                            </span>
                          );
                        })}
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

export default LeagueTable;
