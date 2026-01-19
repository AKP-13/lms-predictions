'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Loader } from 'lucide-react';
import { FixturesData } from '@/lib/definitions';
import { TeamForm } from '@/components/TeamForm';
import { TeamsArr } from './page';
import { MAX_GW, MIN_GW } from '@/lib/constants';

const FixturesResults = ({
  isLoading,
  fixtures,
  currentGwNumber,
  teamsArr
}: {
  isLoading: boolean;
  fixtures: FixturesData[] | 'The game is being updated';
  currentGwNumber: number;
  teamsArr: TeamsArr;
}) => {
  const [selectedGw, setSelectedGw] = useState(currentGwNumber);

  useEffect(() => {
    setSelectedGw(currentGwNumber);
  }, [currentGwNumber]);

  const fixturesForSelectedGameweek = Array.isArray(fixtures)
    ? fixtures.filter((f) => f.event === selectedGw)
    : [];

  // Group fixtures by date
  const fixturesByDate = fixturesForSelectedGameweek.reduce(
    (acc, fixture) => {
      const date = new Date(fixture.kickoff_time).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(fixture);
      return acc;
    },
    {} as Record<string, FixturesData[]>
  );

  // Sort dates chronologically
  const sortedDates = Object.keys(fixturesByDate).sort((a, b) => {
    const dateA = new Date(fixturesByDate[a][0].kickoff_time).getTime();
    const dateB = new Date(fixturesByDate[b][0].kickoff_time).getTime();
    return dateA - dateB;
  });

  return (
    <Card
      className={`rounded-xl bg-white p-2 shadow-sm ${isLoading ? 'animate-pulse' : ''} h-fit`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="flex flex-row items-center p-2 md:p-6">
        <CardTitle>Fixtures</CardTitle>
        {isLoading && (
          <Loader className="animate-spin mx-2" aria-hidden="true" />
        )}
      </CardHeader>

      <CardContent className="p-2 md:p-6 md:pt-0">
        <Table>
          <TableHeader>
            <TableRow
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <TableHead
                style={{
                  flex: 1,
                  textAlign: 'left',
                  alignContent: 'center'
                }}
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
                style={{
                  flex: 2,
                  textAlign: 'center',
                  alignContent: 'center'
                }}
              >
                Gameweek {selectedGw}
              </TableHead>
              <TableHead
                style={{
                  flex: 1,
                  textAlign: 'right',
                  alignContent: 'center'
                }}
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
            {isLoading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-gray-100 last:border-0 animate-pulse"
                >
                  <TableCell className="flex text-center px-1 py-1 md:p-4 gap-1 justify-center">
                    <div className="mx-auto rounded bg-gray-200 h-5 w-1/2" />
                    <div className="mx-auto rounded bg-gray-200 h-5 w-1/2" />
                  </TableCell>
                </TableRow>
              ))
            ) : Array.isArray(fixtures) && fixtures.length === 0 ? (
              <TableRow>
                <TableCell className="table-cell w-full px-2 text-center">
                  The site is being updated. Please check back later.
                </TableCell>
              </TableRow>
            ) : (
              sortedDates.map((date) => (
                <>
                  {/* Date header */}
                  <TableRow key={`date-${date}`}>
                    <TableCell className="table-cell w-full px-2 py-3 font-semibold bg-gray-50">
                      {date}
                    </TableCell>
                  </TableRow>
                  {/* Fixtures for this date */}
                  {fixturesByDate[date].map((fixture) => {
                const { name: homeTeamName, id: homeTeamId } = teamsArr?.[
                  fixture?.team_h - 1
                ] || { name: 'Unknown', id: 0 };
                const { name: awayTeamName, id: awayTeamId } = teamsArr?.[
                  fixture?.team_a - 1
                ] || { name: 'Unknown', id: 0 };

                const isStarted = fixture.started;
                const isFinished =
                  fixture.finished || fixture.finished_provisional;

                // Format kick-off time
                const kickoffTime = new Date(
                  fixture.kickoff_time
                ).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });

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

                        {/* Center section - Score or Time */}
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
                              {isStarted || isFinished ? (
                                <>
                                  {fixture.team_h_score} - {fixture.team_a_score}
                                </>
                              ) : (
                                kickoffTime
                              )}
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
                </>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FixturesResults;
