'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AdminPrediction, FixturesData, Participant } from '@/lib/definitions';

type TeamsArr = { id: number; name: string; short_name: string }[];

type Props = {
  participants: Participant[];
  existingPredictions: AdminPrediction[];
  teamsArr: TeamsArr;
  predictionWeekFixtures: FixturesData[];
  currentGwNumber: number;
  currentGameId: number;
};

type ParticipantRowProps = {
  participant: Participant;
  userPredictions: AdminPrediction[];
  teamsArr: TeamsArr;
  predictionWeekFixtures: FixturesData[];
  currentGwNumber: number;
};

function FixtureBadge({
  teamSelected,
  teamOpposing,
  location,
  className
}: {
  teamSelected: string;
  teamOpposing: string;
  location: string;
  className?: string;
}) {
  const homeTeam = location === 'Home' ? teamSelected : teamOpposing;
  const awayTeam = location === 'Away' ? teamSelected : teamOpposing;
  const homeIsPick = location === 'Home';

  return (
    <span
      className={cn('text-xs rounded px-2 py-1 whitespace-nowrap', className)}
    >
      {homeIsPick ? <strong>{homeTeam}</strong> : homeTeam}
      {' v '}
      {!homeIsPick ? <strong>{awayTeam}</strong> : awayTeam}
    </span>
  );
}

function ParticipantRow({
  participant,
  userPredictions,
  teamsArr,
  predictionWeekFixtures,
  currentGwNumber
}: ParticipantRowProps) {
  const predictionGw = currentGwNumber + 1;
  const existingThisWeek = userPredictions.find(
    (p) => p.fpl_gw === predictionGw
  );
  const previousPredictions = userPredictions.filter(
    (p) => p.fpl_gw !== predictionGw
  );

  const [selectedTeam, setSelectedTeam] = useState('Select');
  const [selectedOutcome, setSelectedOutcome] = useState('Select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<AdminPrediction | null>(null);

  const displayedThisWeek = submitted ?? existingThisWeek ?? null;

  const previousTeams = userPredictions.map((p) => p.team_selected);
  const roundNumber = userPredictions.length + 1;
  const allTeamNames = teamsArr.map((t) => t.name);

  const teamSelectId = `team-${participant.id}`;
  const outcomeSelectId = `outcome-${participant.id}`;

  const selectedTeamObj = teamsArr.find((t) => t.name === selectedTeam);
  const selectedTeamFixture = predictionWeekFixtures.find(
    (f) => f.team_a === selectedTeamObj?.id || f.team_h === selectedTeamObj?.id
  );
  const isAway = selectedTeamFixture?.team_a === selectedTeamObj?.id;
  const opposingTeamId = isAway
    ? selectedTeamFixture?.team_h
    : selectedTeamFixture?.team_a;
  const opposingTeamName = teamsArr.find((t) => t.id === opposingTeamId)?.name;
  const selectedTeamLocation = isAway ? 'Away' : 'Home';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: participant.id,
          team_selected: selectedTeam,
          team_opposing: opposingTeamName,
          team_selected_location: selectedTeamLocation,
          result_selected: selectedOutcome,
          fpl_gw: selectedTeamFixture?.event,
          round_number: roundNumber
        })
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted({
        user_id: participant.id,
        team_selected: selectedTeam,
        team_opposing: opposingTeamName ?? '',
        team_selected_location: selectedTeamLocation,
        result_selected: selectedOutcome,
        correct: null,
        fpl_gw: selectedTeamFixture?.event ?? null,
        round_number: roundNumber,
        prediction_submitted_time: new Date().toISOString()
      });
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="align-top font-medium whitespace-nowrap">
        <div>{participant.name ?? '—'}</div>
        <div className="text-xs text-muted-foreground">{participant.email}</div>
      </TableCell>

      <TableCell className="align-top">
        {previousPredictions.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            No previous picks
          </span>
        ) : (
          <div className="flex flex-col gap-1">
            {previousPredictions.map((p) => {
              const bg =
                p.correct === true
                  ? 'bg-green-200'
                  : p.correct === false
                    ? 'bg-red-200'
                    : 'bg-gray-100';
              return (
                <span
                  key={p.round_number}
                  className={`text-xs rounded px-2 py-1 whitespace-nowrap ${bg}`}
                >
                  GW{p.fpl_gw}: {p.team_selected}
                </span>
              );
            })}
          </div>
        )}
      </TableCell>

      <TableCell className="align-top">
        {displayedThisWeek ? (
          <FixtureBadge
            teamSelected={displayedThisWeek.team_selected}
            teamOpposing={displayedThisWeek.team_opposing}
            location={displayedThisWeek.team_selected_location}
            className="bg-gray-100"
          />
        ) : predictionWeekFixtures.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            No fixtures for GW{predictionGw}
          </span>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex flex-col gap-1">
                <label htmlFor={teamSelectId} className="text-xs font-medium">
                  Team
                </label>
                <Select
                  id={teamSelectId}
                  options={['Select', ...allTeamNames]}
                  disabledOptions={['Select', ...previousTeams]}
                  value={selectedTeam}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSelectedTeam(e.target.value);
                    setSelectedOutcome('Select');
                    setError(null);
                  }}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={outcomeSelectId}
                  className="text-xs font-medium"
                >
                  Outcome
                </label>
                <Select
                  id={outcomeSelectId}
                  options={['Select', 'Win', 'Draw']}
                  disabledOptions={['Select']}
                  value={selectedOutcome}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSelectedOutcome(e.target.value);
                    setError(null);
                  }}
                  disabled={selectedTeam === 'Select' || isSubmitting}
                />
              </div>

              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={
                  selectedTeam === 'Select' ||
                  selectedOutcome === 'Select' ||
                  !opposingTeamName ||
                  isSubmitting
                }
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>

            {selectedTeam !== 'Select' && (
              <p className="text-xs text-muted-foreground">
                {opposingTeamName ? (
                  selectedTeamLocation === 'Home' ? (
                    <>
                      <strong>{selectedTeam}</strong> v {opposingTeamName}
                    </>
                  ) : (
                    <>
                      {opposingTeamName} v <strong>{selectedTeam}</strong>
                    </>
                  )
                ) : (
                  `No fixture found for ${selectedTeam} in GW${predictionGw}`
                )}
              </p>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function AdminInputForm({
  participants,
  existingPredictions,
  teamsArr,
  predictionWeekFixtures,
  currentGwNumber,
  currentGameId
}: Props) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle>Admin: Enter Predictions</CardTitle>
        <CardDescription>
          GW{currentGwNumber + 1} predictions — Game #{currentGameId}. Submitted
          predictions are read-only.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-2 md:p-6 md:pt-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Previous picks (this game)</TableHead>
              <TableHead>GW{currentGwNumber + 1} pick</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => {
              const userPredictions = existingPredictions.filter(
                (p) => p.user_id === participant.id
              );
              return (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  userPredictions={userPredictions}
                  teamsArr={teamsArr}
                  predictionWeekFixtures={predictionWeekFixtures}
                  currentGwNumber={currentGwNumber}
                />
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
