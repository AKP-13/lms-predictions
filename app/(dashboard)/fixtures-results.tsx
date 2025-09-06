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
import { FixturesData } from '@/lib/definitions';
import { TeamForm } from '@/components/TeamForm';
import { TeamsArr } from './page';
import { MAX_GW, MIN_GW } from '@/lib/constants';

const FixturesResults = ({
  fixtures,
  currentGwNumber,
  teamsArr
}: {
  fixtures: FixturesData[] | 'The game is being updated';
  currentGwNumber: number;
  teamsArr: TeamsArr;
}) => {
  const [selectedGw, setSelectedGw] = useState(currentGwNumber);

  const fixturesForSelectedGameweek = Array.isArray(fixtures)
    ? fixtures.filter((f) => f.event === selectedGw)
    : [];

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
                style={{ flex: 1, textAlign: 'left', alignContent: 'center' }}
              >
                <button
                  aria-label="Previous Gameweek"
                  disabled={selectedGw === MIN_GW}
                  onClick={() => setSelectedGw((prevState) => prevState - 1)}
                  style={{
                    height: '100%',
                    width: '100%',
                    textAlign: 'left',
                    cursor: selectedGw === MIN_GW ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
              </TableHead>
              <TableHead
                className="text-center font-bold bg-[lightgrey]"
                style={{ flex: 2, textAlign: 'center', alignContent: 'center' }}
              >
                Gameweek {selectedGw}
              </TableHead>
              <TableHead
                style={{ flex: 1, textAlign: 'right', alignContent: 'center' }}
              >
                <button
                  aria-label="Next Gameweek"
                  disabled={selectedGw === MAX_GW}
                  onClick={() => setSelectedGw((prevState) => prevState + 1)}
                  style={{
                    height: '100%',
                    width: '100%',
                    textAlign: 'right',
                    cursor: selectedGw === MAX_GW ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixturesForSelectedGameweek.map((fixture) => {
              const { name: homeTeamName, id: homeTeamId } =
                teamsArr[fixture.team_h - 1];
              const { name: awayTeamName, id: awayTeamId } =
                teamsArr[fixture.team_a - 1];

              const isStarted = fixture.started;
              const isFinished = fixture.finished;

              return (
                <TableRow
                  key={fixture.code}
                  className="border-b border-gray-100 last:border-0"
                >
                  <TableCell className="table-cell w-full px-2">
                    <div className="grid grid-cols-12 items-center gap-2">
                      {/* Left section - Home team */}
                      <div className="col-span-5 flex flex-col xl:flex-row items-center gap-2">
                        {selectedGw <= currentGwNumber && (
                          <div className="flex-shrink-0 order-last xl:order-first w-full xl:w-auto text-left">
                            <TeamForm
                              teamId={homeTeamId}
                              fixtures={fixtures}
                              selectedGw={selectedGw}
                            />
                          </div>
                        )}
                        <span className="flex-1 text-center xl:text-right">
                          {homeTeamName}
                        </span>
                      </div>

                      {/* Center section - Score */}
                      <div className="col-span-2 flex flex-col items-center justify-center">
                        <div
                          className={`min-w-[80px] text-center ${
                            isStarted ? 'font-bold' : 'font-normal'
                          }`}
                        >
                          {isStarted && !isFinished && (
                            <div>Live {fixture.minutes}'</div>
                          )}
                          <div>
                            {isStarted || isFinished
                              ? fixture.team_h_score
                              : ''}{' '}
                            v{' '}
                            {isStarted || isFinished
                              ? fixture.team_a_score
                              : ''}
                          </div>
                        </div>
                      </div>

                      {/* Right section - Away team */}
                      <div className="col-span-5 flex flex-col xl:flex-row items-center gap-2">
                        <span className="flex-1 text-center xl:text-left">
                          {awayTeamName}
                        </span>
                        {selectedGw <= currentGwNumber && (
                          <div className="flex-shrink-0 order-last w-full xl:w-auto text-right">
                            <TeamForm
                              teamId={awayTeamId}
                              fixtures={fixtures}
                              selectedGw={selectedGw}
                            />
                          </div>
                        )}
                      </div>
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

export default FixturesResults;
