import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { FixturesData, Results } from '@/lib/definitions';
import { TeamsArr } from 'app/(dashboard)/page';
import { Session } from 'next-auth';

interface PickPlannerProps {
  teams: TeamsArr;
  fixtures: FixturesData[];
  currentGwNumber: number;
  numWeeks?: number;
  results: Record<number, Results[]>;
  session: Session | null;
}

const PickPlanner: React.FC<PickPlannerProps> = ({
  teams,
  fixtures,
  currentGwNumber,
  numWeeks = 5,
  results,
  session
}) => {
  const gameweekNumbers = Object.keys(results).map(Number);
  const latestGameweek = Math.max(...gameweekNumbers);
  const previousPicksArr =
    results[latestGameweek]?.map((val) => val?.team_selected) ?? [];
  const [picks, setPicks] = useState<{ [gw: number]: number | null }>({});

  const isLoading = session === undefined;

  // Helper: get fixture for a team in a given GW
  const getFixture = (teamId: number, gw: number) => {
    const fixture = fixtures.find(
      (f) => f.event === gw && (f.team_h === teamId || f.team_a === teamId)
    );
    if (!fixture) return null;
    const isHome = fixture.team_h === teamId;
    const n = teams.find(
      (t) => t.id === (isHome ? fixture.team_a : fixture.team_h)
    );
    if (!n) return null;
    return `${n.name} (${isHome ? 'H' : 'A'})`;
  };

  // Helper: check if team is already planned to be picked in any GW
  const returnIsTeamPlanned = (teamId: number) => {
    if (Object.values(picks).includes(teamId)) {
      return true;
    }
    return false;
  };

  // Helper to check if a team has already been predicted in previous gameweeks
  const returnIsPreviouslyPredicted = (teamId: number) => {
    const foundTeam = teams.find((t) => t.id === teamId);
    return (
      Array.isArray(previousPicksArr) &&
      previousPicksArr.length > 0 &&
      teams.length > 0 &&
      foundTeam &&
      previousPicksArr.includes(foundTeam.name)
    );
  };

  // Handle pick
  const handlePick = (teamId: number, gw: number) => {
    const isTeamPlanned = returnIsTeamPlanned(teamId);
    // team not previously selected
    if (!isTeamPlanned) {
      setPicks((prev) => ({ ...prev, [gw]: teamId }));
    }
    // team selected but in a different gw
    else if (isTeamPlanned && picks[gw] !== teamId) {
      // Remove the team from previous gw
      const gwToRemove = Object.entries(picks).find(
        ([, value]) => value === teamId
      );
      if (gwToRemove) {
        setPicks((prev) => {
          const updated = { ...prev };
          delete updated[Number(gwToRemove[0])];
          return { ...updated, [gw]: teamId };
        });
      }
    }
    // team selected in same gw (remove)
    else if (isTeamPlanned && picks[gw] === teamId) {
      setPicks((prev) => {
        const updated = { ...prev };
        delete updated[gw];
        return updated;
      });
    } else {
      return;
    }
  };

  return (
    <Card
      className={`rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto ${isLoading ? 'animate-pulse' : ''}`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader>
        <CardTitle className="flex flex-row items-center">
          Pick Planner
        </CardTitle>
        <CardDescription>Plan your picks.</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          // Loading skeleton
          <div>
            {[0, 1, 2].map((rowIdx) => (
              <div className="flex" key={`skeleton-row-${rowIdx}`}>
                {[...Array(5)].map((_, colIdx) => (
                  <div
                    key={`skeleton-cell-${rowIdx}-${colIdx}`}
                    className={`my-2 rounded-full bg-gray-200 ${
                      rowIdx === 0 ? 'h-10' : 'h-5'
                    } w-1/5`}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : session === null ? (
          // Sign in prompt
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              style={{ color: 'blue', fontWeight: 600, textAlign: 'center' }}
              href="/api/auth/signin"
            >
              Sign in to get started
            </a>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-center">Team</TableHead>
                {[...Array(numWeeks)].map((_, idx) => (
                  <TableHead key={idx} className="font-medium text-center">
                    GW{currentGwNumber + 1 + idx}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium text-center">
                    {team.name}
                  </TableCell>
                  {[...Array(numWeeks)].map((_, weekIdx) => {
                    const gw = currentGwNumber + 1 + weekIdx;
                    const fixture = getFixture(team.id, gw);
                    const isTeamPlanned = returnIsTeamPlanned(team.id);
                    const isPreviouslyPredicted = returnIsPreviouslyPredicted(
                      team.id
                    );
                    const isTeamPlannedThisGw = picks[gw] === team.id;

                    return (
                      <TableCell
                        key={weekIdx}
                        className={`${isTeamPlannedThisGw ? 'border border-blue-500' : isPreviouslyPredicted ? 'cursor-not-allowed' : 'cursor-pointer'} text-center ${isTeamPlannedThisGw ? 'bg-blue-100' : isPreviouslyPredicted ? 'bg-gray-500' : isTeamPlanned ? 'bg-[rgba(156,163,175,0.3)]' : 'bg-white'} ${fixture ? '' : 'opacity-50'}`}
                        aria-disabled={isPreviouslyPredicted || !fixture}
                        onClick={() =>
                          !isPreviouslyPredicted &&
                          fixture &&
                          handlePick(team.id, gw)
                        }
                        style={{ minWidth: 80 }}
                      >
                        {fixture || '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PickPlanner;
