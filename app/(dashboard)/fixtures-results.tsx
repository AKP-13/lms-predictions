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
import { teamsArr } from '@/lib/constants';

const FixturesAndResults = ({ fixtures }: { fixtures: FixturesData[] }) => {
  const [selectedGameWeekId, setSelectedGameWeekId] = useState(29);

  const fixturesForSelectedGameweek = fixtures.filter(
    (f) => f.event === selectedGameWeekId
  );

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
                style={{ flex: 2, textAlign: 'center', alignContent: 'center' }}
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

              const isStarted = fixture.started;
              const isFinished = fixture.finished;

              return (
                <TableRow key={fixture.code}>
                  <TableCell className="table-cell">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        textAlign: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ flex: 1, textAlign: 'right' }}>
                        {homeTeam}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 0.5,
                          textAlign: 'center',
                          fontWeight: isStarted ? 'bold' : 'normal'
                        }}
                      >
                        {isStarted && !isFinished && (
                          <span>Live {fixture.minutes}'</span>
                        )}
                        <span>
                          {isStarted || isFinished ? fixture.team_h_score : ''}{' '}
                          v{' '}
                          {isStarted || isFinished ? fixture.team_a_score : ''}
                        </span>
                      </div>
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
