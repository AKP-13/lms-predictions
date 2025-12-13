'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { TeamsArr } from './page';
import { FixturesData, Results } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Session } from 'next-auth';
import { Loader } from 'lucide-react';

type Outcome = 'Win' | 'Draw';

type Props = {
  results: Record<number, Results[]>;
  teamsArr: TeamsArr;
  session: Session | null;
  predictionWeekFixtures: FixturesData[];
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  currentGameId: number | null;
};

const returnIsPastSubmissionDeadline = ({
  predictionWeekFixtures
}: {
  predictionWeekFixtures: FixturesData[];
}) => {
  const currentDate = new Date().getTime();

  if (predictionWeekFixtures.length === 0) {
    return false;
  }

  const firstFixtureDate = predictionWeekFixtures[0]?.kickoff_time;
  const submissionDeadlineTimestamp =
    new Date(firstFixtureDate).getTime() - 12 * 60 * 60 * 1000; // 12 hours before first fixture

  return currentDate > submissionDeadlineTimestamp;
};

const Predictions = ({
  results,
  teamsArr,
  session,
  predictionWeekFixtures,
  setRefreshTrigger,
  isLoading,
  currentGameId
}: Props) => {
  // Find the latest gameweek by key (maximum number)
  const previousPicksArr =
    typeof currentGameId === 'number'
      ? (results[currentGameId]?.map((val) => val?.team_selected) ?? [])
      : [];

  const isPastSubmissionDeadline = returnIsPastSubmissionDeadline({
    predictionWeekFixtures
  });

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
          fpl_gw: selectedTeamFixture?.event,
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
      className={`rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto ${isLoadingCombined ? 'animate-pulse' : ''}`}
      aria-busy={isLoadingCombined}
      aria-live="polite"
    >
      <CardHeader>
        <CardTitle className="flex flex-row items-center">
          Prediction{' '}
          {isLoadingCombined && (
            <Loader className="animate-spin mx-2" aria-hidden="true" />
          )}
        </CardTitle>

        <CardDescription
          className={isPastSubmissionDeadline ? 'text-red-500' : ''}
        >
          {isLoadingCombined
            ? 'Loading...'
            : isEliminated
              ? 'You are unable to make a prediction as you have been eliminated.'
              : isPending
                ? 'Prediction submitted. Good luck!'
                : isPastSubmissionDeadline
                  ? 'The submission deadline has passed for this gameweek.'
                  : 'Submit your prediction for this gameweek.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoadingCombined ? (
          <div className="flex flex-col">
            <div className="flex">
              <div className="my-4 mr-2 flex flex-col items-center w-full">
                <div className="h-5 w-24 rounded-full bg-gray-200 my-2" />
                <div className="h-5 w-24 rounded-full bg-gray-200 my-2" />
              </div>

              <div className="my-4 ml-2 flex flex-col items-center w-full">
                <div className="h-5 w-24 rounded-full bg-gray-200 my-2" />
                <div className="h-5 w-24 rounded-full bg-gray-200 my-2" />
              </div>
            </div>

            <div className="h-5 w-full rounded-full bg-gray-200" />
          </div>
        ) : session === null ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              style={{ color: 'blue', fontWeight: 600, textAlign: 'center' }}
              href="/api/auth/signin"
            >
              Sign in to get started
            </a>
          </div>
        ) : (
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="flex">
              <div className="my-4 mr-2 flex flex-col items-center w-full">
                <label htmlFor="team">Team</label>
                <Select
                  name="team"
                  id="team"
                  options={['Select', ...teams]}
                  disabledOptions={['Select', ...previousPicksArr]}
                  style={{ width: '100%' }}
                  value={selectedTeam}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSelectedTeam(e.target.value);
                    setError(null);
                  }}
                  disabled={
                    isEliminated ||
                    isPending ||
                    isPastSubmissionDeadline ||
                    isLoadingCombined
                  }
                />
              </div>

              <div className="my-4 ml-2 flex flex-col items-center w-full">
                <label htmlFor="outcome">Outcome</label>
                <Select
                  name="outcome"
                  id="outcome"
                  options={['Select', ...outcomes]}
                  style={{ width: '100%' }}
                  value={selectedOutcome}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSelectedOutcome(e.target.value as Outcome);
                    setError(null);
                  }}
                  disabledOptions={['Select']}
                  disabled={
                    isEliminated ||
                    isPending ||
                    isPastSubmissionDeadline ||
                    isLoadingCombined
                  }
                />
              </div>
            </div>

            {selectedTeam !== 'Select' && selectedOutcome !== 'Select' && (
              <div className="my-2">
                Are you sure you want to predict a
                {['a', 'e', 'i', 'o', 'u'].includes(
                  selectedTeam[0].toLowerCase()
                )
                  ? 'n'
                  : ''}{' '}
                <strong>
                  {selectedTeam} {selectedOutcome.toLowerCase()} vs{' '}
                  {opposingTeamName}
                  {selectedTeamLocation === 'Home' ? ' at home' : ' away'}?
                </strong>{' '}
                If this doesn't look right, please email your prediction{' '}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}?subject=Last%20Player%20Standing%20Prediction%20Week%20${selectedTeamFixture ? selectedTeamFixture.event : 'Undefined'}&body=My%20prediction%20this%20week%20is...`}
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  here
                </a>
                .
              </div>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                selectedTeam === 'Select' ||
                selectedOutcome === 'Select' ||
                isEliminated ||
                isPastSubmissionDeadline ||
                isLoadingCombined
              }
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {success && (
              <div className="text-green-500 mt-2">Prediction submitted!</div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default Predictions;
