'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { badgeVariants } from '@/components/ui/badge';
import { FixturesData } from '@/lib/definitions';
import { TeamForm } from '@/components/TeamForm';
import { TeamsArr } from '@/lib/definitions';
import { MAX_GW, MIN_GW } from '@/lib/constants';
import {
  groupFixturesByDate,
  getSortedDates,
  formatKickoffTime
} from '@/lib/fixtures';
import { cn } from '@/lib/utils';

const ROW_CLASSES =
  'grid min-h-12 grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] items-center gap-2 py-1.5';
const TEAM_CLASSES = 'flex min-w-0 flex-col gap-1 text-[0.9375rem] font-bold';
const STEP_CLASSES =
  'flex size-7 items-center justify-center rounded-full transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

const GameweekStepper = ({
  gameweek,
  setGameweek
}: {
  gameweek: number;
  setGameweek: (gameweek: number) => void;
}) => (
  <div className="flex shrink-0 items-center gap-1 rounded-full bg-chip p-1">
    <button
      type="button"
      aria-label="Previous gameweek"
      disabled={gameweek === MIN_GW}
      onClick={() => setGameweek(gameweek - 1)}
      className={STEP_CLASSES}
    >
      <ChevronLeft aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
    </button>
    <span className="px-1 text-[0.8125rem] font-extrabold">GW {gameweek}</span>
    <button
      type="button"
      aria-label="Next gameweek"
      disabled={gameweek === MAX_GW}
      onClick={() => setGameweek(gameweek + 1)}
      className={STEP_CLASSES}
    >
      <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
    </button>
  </div>
);

const KickoffChip = ({ fixture }: { fixture: FixturesData }) => {
  const isStarted = fixture.started;
  const isFinished = fixture.finished || fixture.finished_provisional;
  const isLive = isStarted && !isFinished;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          'flex h-[1.875rem] w-full items-center justify-center rounded-[0.625rem] text-[0.8125rem]',
          isLive
            ? 'bg-accent-bg font-extrabold text-accent'
            : isStarted
              ? 'bg-chip font-extrabold text-foreground'
              : 'bg-chip font-bold text-muted-foreground'
        )}
      >
        {isStarted
          ? `${fixture.team_h_score} – ${fixture.team_a_score}`
          : formatKickoffTime(fixture.kickoff_time)}
      </span>
      {isLive && (
        <span className="text-[0.6875rem] font-bold leading-4 text-accent">
          Live {fixture.minutes}&apos;
        </span>
      )}
    </div>
  );
};

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
  // The most recent started gameweek, which is one behind the gameweek being
  // predicted for. Deliberately does not track the prediction gameweek.
  const [selectedGw, setSelectedGw] = useState(currentGwNumber);

  useEffect(() => {
    setSelectedGw(currentGwNumber);
  }, [currentGwNumber]);

  // Group fixtures by date for the selected gameweek
  const fixturesByDate = Array.isArray(fixtures)
    ? groupFixturesByDate(fixtures, selectedGw)
    : {};

  // Sort dates chronologically
  const sortedDates = getSortedDates(fixturesByDate);

  const showForm = selectedGw <= currentGwNumber;

  return (
    <Card
      className={cn('h-fit', isLoading && 'animate-pulse')}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 pb-1 md:p-6 md:pb-1">
        <CardTitle className="flex items-center gap-2">
          Fixtures
          {isLoading && (
            <Loader
              className="size-5 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </CardTitle>
        <GameweekStepper gameweek={selectedGw} setGameweek={setSelectedGw} />
      </CardHeader>

      <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
        {isLoading ? (
          <div aria-hidden="true">
            <div className="mb-1 mt-3.5 h-7 w-24 rounded-full bg-chip" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className={ROW_CLASSES}>
                <div className="ml-auto h-4 w-20 rounded-full bg-chip" />
                <div className="h-[1.875rem] rounded-[0.625rem] bg-chip" />
                <div className="h-4 w-20 rounded-full bg-chip" />
              </div>
            ))}
          </div>
        ) : !Array.isArray(fixtures) || fixtures.length === 0 ? (
          <p className="pt-3 text-center text-muted-foreground">
            {typeof fixtures === 'string'
              ? fixtures
              : 'The site is being updated. Please check back later.'}
          </p>
        ) : (
          sortedDates.map((date) => (
            <section key={date}>
              <h4
                className={cn(
                  badgeVariants({ variant: 'secondary' }),
                  'mb-1 mt-3.5'
                )}
              >
                {date}
              </h4>
              <ul>
                {fixturesByDate[date].map((fixture) => {
                  const { name: homeTeamName, id: homeTeamId } = teamsArr?.[
                    fixture?.team_h - 1
                  ] || { name: 'Unknown', id: 0 };
                  const { name: awayTeamName, id: awayTeamId } = teamsArr?.[
                    fixture?.team_a - 1
                  ] || { name: 'Unknown', id: 0 };

                  return (
                    <li key={fixture.code} className={ROW_CLASSES}>
                      <div className={cn(TEAM_CLASSES, 'items-end text-right')}>
                        {homeTeamName}
                        {showForm && (
                          <TeamForm
                            teamId={homeTeamId}
                            fixtures={fixtures}
                            selectedGw={selectedGw}
                          />
                        )}
                      </div>
                      <KickoffChip fixture={fixture} />
                      <div className={TEAM_CLASSES}>
                        {awayTeamName}
                        {showForm && (
                          <TeamForm
                            teamId={awayTeamId}
                            fixtures={fixtures}
                            selectedGw={selectedGw}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default FixturesResults;
