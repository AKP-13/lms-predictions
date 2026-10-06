'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { TeamsArr } from '@/lib/definitions';
import { FixturesData, Results } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormError } from '@/components/form-error';
import { cn } from '@/lib/utils';
import {
  MINUTE_MS,
  formatCountdown,
  returnSubmissionDeadline
} from '@/lib/gameweek';
import { Session } from 'next-auth';
import { ArrowRight, Clock, Loader } from 'lucide-react';

type Outcome = 'Win' | 'Draw';

const CountdownPill = ({ deadline }: { deadline: number | null }) => {
  const [now, setNow] = useState(() => Date.now());

  // Tick when the text changes, so the pill goes at the deadline.
  useEffect(() => {
    if (deadline === null) return;
    const msLeft = deadline - Date.now();
    if (!(msLeft > 0)) return;
    const id = setTimeout(
      () => setNow(Date.now()),
      msLeft % MINUTE_MS || MINUTE_MS
    );
    return () => clearTimeout(id);
  }, [deadline, now]);

  const text = deadline === null ? null : formatCountdown(deadline, now);
  if (text === null) return null;

  return (
    <Badge className="shrink-0">
      <Clock className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
      <span className="sr-only">Picks lock in </span>
      {text}
    </Badge>
  );
};

type Props = {
  results: Record<number, Results[]>;
  teamsArr: TeamsArr;
  session: Session | null;
  predictionWeekFixtures: FixturesData[];
  predictionGwNumber: number | null;
  isPastSubmissionDeadline: boolean;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  currentGameId: number | null;
};

const Predictions = ({
  results,
  teamsArr,
  session,
  predictionWeekFixtures,
  predictionGwNumber,
  isPastSubmissionDeadline,
  setRefreshTrigger,
  isLoading,
  currentGameId
}: Props) => {
  // Find the latest gameweek by key (maximum number)
  const previousPicksArr =
    typeof currentGameId === 'number'
      ? (results[currentGameId]?.map((val) => val?.team_selected) ?? [])
      : [];

  const isEliminated =
    typeof currentGameId === 'number' &&
    results[currentGameId]?.some((val) => val.correct === false);

  const isPending =
    typeof currentGameId === 'number' &&
    results[currentGameId]?.some((val) => val.correct === null);

  const teams = teamsArr.map(({ name }) => name);
  const outcomes: Outcome[] = ['Win', 'Draw'];

  const [selectedTeam, setSelectedTeam] = useState<string>('Select');
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | 'Select'>(
    'Select'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLoadingCombined = isLoading || isSubmitting;

  // Either the bootstrap gave us nothing usable, or the gameweek it resolved to
  // has no fixtures. Both mean we cannot say what anyone is predicting for.
  const isGameweekUnresolved =
    !isLoadingCombined &&
    (predictionGwNumber === null || predictionWeekFixtures.length === 0);

  const isFormDisabled =
    isEliminated ||
    isPending ||
    isPastSubmissionDeadline ||
    isGameweekUnresolved ||
    isLoadingCombined;

  // The player can still pick, or email to change a pick.
  const isBeforeDeadline =
    !isEliminated && !isPastSubmissionDeadline && !isGameweekUnresolved;

  const emailHref = `mailto:${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}?subject=Last%20Player%20Standing%20Prediction%20Week%20${predictionGwNumber}`;

  const selectedTeamFixture = predictionWeekFixtures?.find(
    (fixture) =>
      fixture.team_a ===
        teamsArr.find((team) => team.name === selectedTeam)?.id ||
      fixture.team_h === teamsArr.find((team) => team.name === selectedTeam)?.id
  );

  const opposingTeamId =
    selectedTeamFixture?.team_a ===
    teamsArr.find((team) => team.name === selectedTeam)?.id
      ? selectedTeamFixture?.team_h
      : selectedTeamFixture?.team_a;

  const opposingTeamName = teamsArr.find(
    (team) => team.id === opposingTeamId
  )?.name;

  const selectedTeamLocation =
    selectedTeamFixture?.team_a ===
    teamsArr.find((team) => team.name === selectedTeam)?.id
      ? 'Away'
      : 'Home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Never submit against a gameweek we could not resolve
    if (predictionGwNumber === null || !selectedTeamFixture) {
      setError(
        'Predictions are unavailable right now. Please try again shortly.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          team_selected: selectedTeam,
          team_opposing: opposingTeamName,
          team_selected_location: selectedTeamLocation,
          result_selected: selectedOutcome,
          fpl_gw: predictionGwNumber,
          round_number: previousPicksArr.length + 1
        })
      });
      if (!res.ok) {
        throw new Error(
          `Failed to submit prediction. Please email it to ${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS} instead.`
        );
      }
      setSuccess(true);
      setSelectedTeam('Select');
      setSelectedOutcome('Select');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      className={cn(
        'bg-tint p-5 shadow-none md:p-7',
        isLoadingCombined && 'animate-pulse'
      )}
      aria-busy={isLoadingCombined}
      aria-live="polite"
    >
      <CardHeader className="space-y-1 p-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center text-2xl leading-7 md:text-[1.625rem] md:leading-[1.875rem]">
            Who are you backing?
            {isLoadingCombined && (
              <Loader className="animate-spin mx-2" aria-hidden="true" />
            )}
          </CardTitle>
          {session && !isLoadingCombined && isBeforeDeadline && (
            <CountdownPill
              deadline={returnSubmissionDeadline({ predictionWeekFixtures })}
            />
          )}
        </div>

        <CardDescription
          className={
            isPastSubmissionDeadline || isGameweekUnresolved
              ? 'text-destructive'
              : ''
          }
        >
          {isLoadingCombined
            ? 'Loading...'
            : isEliminated
              ? 'You are unable to make a prediction as you have been eliminated.'
              : isGameweekUnresolved
                ? 'Predictions are unavailable right now. Please try again shortly.'
                : isPending
                  ? 'Prediction submitted. Good luck!'
                  : isPastSubmissionDeadline
                    ? 'The submission deadline has passed for this gameweek.'
                    : `Submit your prediction for gameweek ${predictionGwNumber}.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 pt-4">
        {isLoadingCombined ? (
          <div className="flex flex-col gap-3">
            <div className="h-14 w-full rounded-2xl bg-card" />
            <div className="h-11 w-full rounded-full bg-card" />
            <div className="mt-2 h-14 w-full rounded-full bg-card" />
          </div>
        ) : session === null ? (
          <div className="flex justify-center">
            <a className="text-center font-semibold text-primary" href="/login">
              Sign in to get started
            </a>
          </div>
        ) : (
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start lg:grid-cols-1">
              <label htmlFor="team" className="sr-only">
                Team
              </label>
              <Select
                name="team"
                id="team"
                className="w-full"
                options={['Select', ...teams]}
                disabledOptions={['Select', ...previousPicksArr]}
                value={selectedTeam}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSelectedTeam(e.target.value);
                  setError(null);
                }}
                disabled={isFormDisabled}
              />

              <div role="group" aria-label="Outcome" className="flex gap-2">
                {outcomes.map((outcome) => (
                  <Button
                    key={outcome}
                    type="button"
                    variant={
                      selectedOutcome === outcome ? 'default' : 'outline'
                    }
                    aria-pressed={selectedOutcome === outcome}
                    className={cn(
                      'h-11 flex-1 font-bold md:h-14',
                      selectedOutcome === outcome
                        ? 'border-2 border-primary'
                        : 'bg-card'
                    )}
                    onClick={() => {
                      setSelectedOutcome(outcome);
                      setError(null);
                    }}
                    disabled={isFormDisabled}
                  >
                    {outcome}
                  </Button>
                ))}
              </div>
            </div>

            {selectedTeam !== 'Select' &&
              selectedOutcome !== 'Select' &&
              predictionGwNumber !== null && (
                <p className="mt-4 text-[0.9375rem] leading-[1.375rem]">
                  Are you sure you want to predict a
                  {['a', 'e', 'i', 'o', 'u'].includes(
                    selectedTeam[0].toLowerCase()
                  )
                    ? 'n'
                    : ''}{' '}
                  <strong>
                    {selectedTeam} {selectedOutcome.toLowerCase()} vs{' '}
                    {opposingTeamName}
                    {selectedTeamLocation === 'Home' ? ' at home' : ' away'} in
                    GW{predictionGwNumber}?
                  </strong>{' '}
                  If this doesn't look right, please email your prediction{' '}
                  <a
                    href={`${emailHref}&body=My%20prediction%20this%20week%20is...`}
                    className="font-semibold text-primary underline"
                  >
                    here
                  </a>
                  .
                </p>
              )}

            <Button
              type="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={
                isFormDisabled ||
                selectedTeam === 'Select' ||
                selectedOutcome === 'Select'
              }
            >
              {isSubmitting ? 'Locking in...' : 'Lock it in'}
              {!isSubmitting && (
                <ArrowRight
                  className="h-[18px] w-[18px]"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              )}
            </Button>
            {isBeforeDeadline && (
              <p className="mt-3 text-center text-[0.8125rem] font-semibold leading-[1.125rem] text-muted-foreground">
                To change your pick,{' '}
                <a href={emailHref} className="text-primary underline">
                  email us
                </a>{' '}
                before the deadline.
              </p>
            )}
            {error && (
              <div className="mt-3">
                <FormError message={error} />
              </div>
            )}
            {success && (
              <p role="status" className="mt-3 text-sm text-success">
                Prediction submitted!
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default Predictions;
