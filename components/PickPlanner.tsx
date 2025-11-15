import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from '@/components/ui/select';
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
  setNumWeeks?: React.Dispatch<React.SetStateAction<number>>;
  results: Record<number, Results[]>;
  session: Session | null;
  currentGameId: number | null;
}

const PickPlanner: React.FC<PickPlannerProps> = ({
  teams,
  fixtures,
  currentGwNumber,
  numWeeks = 5,
  results,
  session,
  currentGameId,
  setNumWeeks
}) => {
  const previousPicksArr = currentGameId
    ? (results[currentGameId]?.map((val) => val?.team_selected) ?? [])
    : [];
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

    return {
      display: `${n.name} (${isHome ? 'H' : 'A'})`,
      difficulty: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty
    };
  };

  // Helper: check if team is already planned to be picked in any GW
  const returnIsTeamPlanned = (teamId: number) =>
    Object.values(picks).includes(teamId);

  // Helper to check if a team has already been predicted in previous gameweeks
  const returnIsPreviouslyPredicted = (teamId: number) => {
    const foundTeam = teams.find(({ id }) => id === teamId);
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

  const getClassName = (
    isTeamPlannedThisGw: boolean,
    isPreviouslyPredicted: boolean | undefined,
    isTeamPlanned: boolean,
    fixture: string | undefined,
    difficulty: number | undefined
  ) => {
    // Always include a 0.5rem solid white border on cells
    if (isTeamPlannedThisGw)
      return 'border-[0.5rem] border-blue-500 bg-blue-100 text-center rounded-[1rem] transition-colors duration-150 ease-in-out cursor-pointer';
    if (isPreviouslyPredicted)
      return 'border-[0.5rem] border-white cursor-not-allowed bg-gray-500 text-center rounded-[1rem] transition-colors duration-150 ease-in-out';
    if (isTeamPlanned)
      return 'border-[0.5rem] border-white cursor-pointer bg-gray-500 text-center rounded-[1rem] transition-colors duration-150 ease-in-out';
    if (difficulty !== undefined) {
      const bgClass =
        difficulty === 1
          ? 'bg-[#4CAF50]'
          : difficulty === 2
            ? 'bg-[#388E3C] text-white'
            : difficulty === 3
              ? 'bg-[#B0BEC5] text-white'
              : difficulty === 4
                ? 'bg-[#EF5350] text-white'
                : difficulty === 5
                  ? 'bg-[#C62828] text-white'
                  : 'bg-white';
      return `cursor-pointer ${bgClass} text-center border-[0.5rem] border-white rounded-[1rem] transition-colors transition-shadow duration-150 ease-in-out`;
    }
    return `cursor-pointer bg-white text-center border-[0.5rem] border-white rounded-[1rem]${fixture ? '' : ' opacity-50'} transition-colors duration-150 ease-in-out`;
  };

  return (
    <Card
      className={`rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto ${isLoading ? 'animate-pulse' : ''}`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle className="flex flex-row items-center">
              Pick Planner
            </CardTitle>
            <CardDescription>Plan your picks.</CardDescription>
          </div>

          {session && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>Difficulty</span>
                <div className="flex items-start space-x-2">
                  <div className="flex flex-col items-center">
                    <div className="h-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-[#4CAF50]" />
                    </div>
                    <span className="text-xs text-gray-600">1</span>
                    <span className="text-[10px] text-gray-500 min-h-[12px]">
                      Easy
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-[#388E3C]" />
                    </div>
                    <span className="text-xs text-gray-600">2</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-[#B0BEC5]" />
                    </div>
                    <span className="text-xs text-gray-600">3</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-[#EF5350]" />
                    </div>
                    <span className="text-xs text-gray-600">4</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-[#C62828]" />
                    </div>
                    <span className="text-xs text-gray-600">5</span>
                    <span className="text-[10px] text-gray-500 min-h-[12px]">
                      Hard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {setNumWeeks && session && (
            <div className="flex items-center">
              <label htmlFor="weeks" className="text-sm font-medium mr-2">
                Weeks
              </label>
              <Select
                name="weeks"
                id="weeks"
                options={['5', '6', '7', '8', '9', '10']}
                value={String(numWeeks ?? 5)}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNumWeeks(Number(e.target.value))
                }
                aria-label="Number of weeks to show"
                disabled={isLoading}
                className={
                  isLoading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
                }
                style={{ width: 60 }}
              />
            </div>
          )}
        </div>
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
          <Table className="table-fixed border-separate border-spacing-0 w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 font-medium text-center border-[0.5rem] border-white rounded-[1rem]">
                  Team
                </TableHead>
                <AnimatePresence initial={false}>
                  {[...Array(numWeeks)].map((_, idx) => {
                    const gw = currentGwNumber + 1 + idx;
                    return (
                      <TableHead
                        key={gw}
                        className="w-28 font-medium text-center border-[0.5rem] border-white rounded-[1rem] p-0"
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18 }}
                        >
                          GW{gw}
                        </motion.div>
                      </TableHead>
                    );
                  })}
                </AnimatePresence>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="w-40 font-medium text-center border-[0.5rem] border-white rounded-[1rem]">
                    {team.name}
                  </TableCell>
                  <AnimatePresence initial={false}>
                    {[...Array(numWeeks)].map((_, weekIdx) => {
                      const gw = currentGwNumber + 1 + weekIdx;
                      const { display, difficulty } =
                        getFixture(team.id, gw) || {};
                      const isTeamPlanned = returnIsTeamPlanned(team.id);
                      const isPreviouslyPredicted = returnIsPreviouslyPredicted(
                        team.id
                      );
                      const isTeamPlannedThisGw = picks[gw] === team.id;

                      const className = getClassName(
                        isTeamPlannedThisGw,
                        isPreviouslyPredicted,
                        isTeamPlanned,
                        display,
                        difficulty
                      );

                      return (
                        <TableCell
                          key={`${team.id}-${gw}`}
                          className={`${className} w-28`}
                          aria-disabled={isPreviouslyPredicted || !display}
                          onClick={() =>
                            !isPreviouslyPredicted &&
                            display &&
                            handlePick(team.id, gw)
                          }
                        >
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                          >
                            {display || '-'}
                          </motion.div>
                        </TableCell>
                      );
                    })}
                  </AnimatePresence>
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
