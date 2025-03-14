'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

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
  stats:
    | any
    | (
        | {
            identifier: 'goals_scored';
            a: StatsObj[];
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
            a: StatsObj[];
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

const FixturesAndResults = ({ fixtures }: { fixtures: FixturesData[] }) => {
  const [selectedGameWeekId, setSelectedGameWeekId] = useState(29);

  const fixturesForSelectedGameweek = fixtures.filter(
    (f) => f.event === selectedGameWeekId
  );

  console.log('fixturesForSelectedGameweek', fixturesForSelectedGameweek);

  const teamsArr = [
    {
      id: 1,
      name: 'Arsenal',
      short_name: 'ARS'
    },
    {
      id: 2,
      name: 'Aston Villa',
      short_name: 'AVL'
    },
    {
      id: 3,
      name: 'Bournemouth',
      short_name: 'BOU'
    },
    {
      id: 4,
      name: 'Brentford',
      short_name: 'BRE'
    },
    {
      id: 5,
      name: 'Brighton',
      short_name: 'BHA'
    },
    {
      id: 6,
      name: 'Chelsea',
      short_name: 'CHE'
    },
    {
      id: 7,
      name: 'Crystal Palace',
      short_name: 'CRY'
    },
    {
      id: 8,
      name: 'Everton',
      short_name: 'EVE'
    },
    {
      id: 9,
      name: 'Fulham',
      short_name: 'FUL'
    },
    {
      id: 10,
      name: 'Ipswich',
      short_name: 'IPS'
    },
    {
      id: 11,
      name: 'Leicester',
      short_name: 'LEI'
    },
    {
      id: 12,
      name: 'Liverpool',
      short_name: 'LIV'
    },
    {
      id: 13,
      name: 'Man City',
      short_name: 'MCI'
    },
    {
      id: 14,
      name: 'Man Utd',
      short_name: 'MUN'
    },
    {
      id: 15,
      name: 'Newcastle',
      short_name: 'NEW'
    },
    {
      id: 16,
      name: "Nott'm Forest",
      short_name: 'NFO'
    },
    {
      id: 17,
      name: 'Southampton',
      short_name: 'SOU'
    },
    {
      id: 18,
      name: 'Spurs',
      short_name: 'TOT'
    },
    {
      id: 19,
      name: 'West Ham',
      short_name: 'WHU'
    },
    {
      id: 20,
      name: 'Wolves',
      short_name: 'WOL'
    }
  ];

  return (
    <Card className="rounded-xl bg-white p-2 shadow-sm ">
      <CardHeader>
        <CardTitle>Fixtures</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <TableHead
                role="button"
                onClick={() =>
                  setSelectedGameWeekId((prevState) => prevState - 1)
                }
                style={{ flex: 1, textAlign: 'left', alignContent: 'center' }}
              >
                Previous
              </TableHead>
              <TableHead
                className="text-center font-bold bg-[lightgrey]"
                style={{ flex: 1, textAlign: 'center', alignContent: 'center' }}
              >
                Gameweek {selectedGameWeekId}
              </TableHead>
              <TableHead
                role="button"
                onClick={() =>
                  setSelectedGameWeekId((prevState) => prevState + 1)
                }
                style={{ flex: 1, textAlign: 'right', alignContent: 'center' }}
              >
                Next
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixturesForSelectedGameweek.map((fixture) => {
              const homeTeam = teamsArr[fixture.team_h - 1].name;
              const awayTeam = teamsArr[fixture.team_a - 1].name;

              return (
                <TableRow key={fixture.code}>
                  <TableCell className="table-cell">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ flex: 1, textAlign: 'right' }}>
                        {homeTeam}
                      </span>
                      <span style={{ flex: 0.5, textAlign: 'center' }}>v</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        {awayTeam}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FixturesAndResults;
