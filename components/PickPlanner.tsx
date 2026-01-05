import {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  useMemo,
  useState
} from 'react';
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

// Constant - never changes
const DIFFICULTY_BG_CLASS_MAP: { [key: number]: string } = {
  1: 'bg-[#4CAF50]',
  2: 'bg-[#388E3C] text-white',
  3: 'bg-[#B0BEC5] text-white',
  4: 'bg-[#EF5350] text-white',
  5: 'bg-[#C62828] text-white'
};

interface PickPlannerProps {
  teams: TeamsArr;
  fixtures: FixturesData[];
  currentGwNumber: number;
  numWeeks?: number;
  setNumWeeks?: Dispatch<SetStateAction<number>>;
  results: Record<number, Results[]>;
  session: Session | null;
  currentGameId: number | null;
}

const WeekPicker = ({
  mobile,
  numWeeks,
  setNumWeeks,
  isLoading
}: {
  mobile: boolean;
  numWeeks: number;
  setNumWeeks: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
}) => {
  const id = `week-picker-${mobile ? 'mobile' : 'desktop'}`;

  return (
    <div
      className={`items-center flex-shrink-0 ${
        mobile ? 'flex lg:hidden' : 'hidden lg:flex lg:order-3'
      }`}
    >
      <label htmlFor={id} className="text-sm font-medium mr-2">
        Weeks
      </label>

      <Select
        name={id}
        id={id}
        options={['5', '6', '7', '8', '9', '10']}
        value={String(numWeeks ?? 5)}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setNumWeeks(Number(e.target.value))
        }
        aria-label="Number of weeks to show"
        disabled={isLoading}
        className={`${isLoading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''} w-[60px]`}
      />
    </div>
  );
};

const PickPlanner: FC<PickPlannerProps> = ({
  teams,
  fixtures,
  currentGwNumber,
  numWeeks = 5,
  results,
  session,
  currentGameId,
  setNumWeeks
}) => {
  const [picks, setPicks] = useState<{ [gw: number]: number | null }>({});

  const isLoading = session === undefined;

  // Create O(1) lookup maps
  const fixtureMap = useMemo(() => {
    // First, create a Map of teams indexed by ID for O(1) lookups
    const teamsById = new Map(teams.map((team) => [team.id, team]));

    const map = new Map<string, { fixtureText: string; difficulty: number }>();

    fixtures.forEach((fixture) => {
      const { event, team_h, team_a, team_h_difficulty, team_a_difficulty } =
        fixture;

      // Home team - O(1) lookup
      const homeOpponent = teamsById.get(team_a);
      if (homeOpponent) {
        map.set(`${event}-${team_h}`, {
          fixtureText: `${homeOpponent.name} (H)`,
          difficulty: team_h_difficulty
        });
      }

      // Away team - O(1) lookup
      const awayOpponent = teamsById.get(team_h);
      if (awayOpponent) {
        map.set(`${event}-${team_a}`, {
          fixtureText: `${awayOpponent.name} (A)`,
          difficulty: team_a_difficulty
        });
      }
    });

    return map;
  }, [fixtures, teams]);

  // Create O(1) lookup Set for previously predicted team IDs
  const previouslyPredictedTeamIds = useMemo(() => {
    const previousPicksArr =
      typeof currentGameId === 'number'
        ? (results[currentGameId]?.map((val) => val?.team_selected) ?? [])
        : [];

    // Create a Map of teams indexed by name for O(1) lookups
    const teamsByName = new Map(teams.map((team) => [team.name, team]));

    const teamIdSet = new Set<number>();
    previousPicksArr.forEach((teamName) => {
      const team = teamsByName.get(teamName);
      if (team) teamIdSet.add(team.id);
    });

    return teamIdSet;
  }, [currentGameId, results, teams]);

  // Helper: get fixture for a team in a given GW - now O(1)
  const getFixture = ({ gw, teamId }: { gw: number; teamId: number }) =>
    fixtureMap.get(`${gw}-${teamId}`) || null;

  // Memoized Set of picked team IDs for O(1) lookup
  const pickedTeamIdsSet = useMemo(
    () =>
      new Set(Object.values(picks).filter((id): id is number => id !== null)),
    [picks]
  );

  // Helper: check if team is already planned to be picked in any GW
  const returnIsTeamPlanned = (teamId: number) => pickedTeamIdsSet.has(teamId);

  // Helper to check if a team has already been predicted - now O(1)
  const returnIsPreviouslyPredicted = (teamId: number) =>
    previouslyPredictedTeamIds.has(teamId);

  // Handle pick
  const handlePick = (teamId: number, gw: number) => {
    const isTeamPlanned = returnIsTeamPlanned(teamId);
    // team not previously selected
    if (!isTeamPlanned) {
      setPicks((prev) => ({ ...prev, [gw]: teamId }));
    }
    // team selected but in a different gw
    else if (picks[gw] !== teamId) {
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
    else if (picks[gw] === teamId) {
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
    isPreviouslyPredicted: boolean,
    isTeamPlanned: boolean,
    fixtureText: string | undefined,
    difficulty: number | undefined
  ) => {
    const baseStyles =
      'border-[0.5rem] md:border-[0.5rem] text-center duration-150 ease-in-out rounded-[1rem] px-1 py-1 md:p-4';
    // Always include a 0.5rem solid border on cells; border color varies based on the cell's state (e.g., blue for planned cells, white otherwise)
    if (isTeamPlannedThisGw)
      return `${baseStyles} border-blue-500 bg-blue-100 transition-colors cursor-pointer`;
    if (isPreviouslyPredicted)
      return `${baseStyles} border-white cursor-not-allowed bg-gray-500 transition-colors`;
    if (isTeamPlanned)
      return `${baseStyles} border-white cursor-pointer bg-gray-500 transition-colors`;
    if (difficulty !== undefined) {
      const bgClass = DIFFICULTY_BG_CLASS_MAP[difficulty] || 'bg-white';
      return `${baseStyles} cursor-pointer ${bgClass} border-white transition-all`;
    }
    return `${baseStyles} cursor-pointer bg-white border-white${fixtureText ? '' : ' opacity-50'} transition-colors`;
  };

  return (
    <Card
      className={`rounded-xl bg-white p-2 shadow-sm overflow-auto ${isLoading ? 'animate-pulse' : ''}`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          {/* Title and Weeks on same row for mobile */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div>
              <CardTitle className="flex flex-row items-center">
                Pick Planner
              </CardTitle>
              <CardDescription className="hidden sm:block">
                Plan your picks.
              </CardDescription>
            </div>

            {/* Weeks dropdown - shows on first row on mobile, on right on large screens */}
            {setNumWeeks && session && (
              <WeekPicker
                mobile
                numWeeks={numWeeks}
                setNumWeeks={setNumWeeks}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Difficulty key - shows in middle on large screens, second row on mobile */}
          {session && (
            <div className="flex items-center space-x-3 text-sm text-gray-600 lg:order-2 justify-center">
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
          )}

          {/* Weeks dropdown for large screens */}
          {setNumWeeks && session && (
            <WeekPicker
              mobile={false}
              numWeeks={numWeeks}
              setNumWeeks={setNumWeeks}
              isLoading={isLoading}
            />
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
          <div className="flex justify-center">
            <a
              className="text-blue-600 font-semibold text-center"
              href="/api/auth/signin"
            >
              Sign in to get started
            </a>
          </div>
        ) : fixtures.length === 0 ? (
          <p className="text-center">
            The site is being updated. Please check back later.
          </p>
        ) : (
          <Table className="table-fixed border-separate border-spacing-0 w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 font-medium text-center border-[0.5rem] border-white rounded-[1rem] px-1 py-1 md:p-4">
                  Team
                </TableHead>
                <AnimatePresence initial={false}>
                  {[...Array(numWeeks)].map((_, idx) => {
                    const gw = currentGwNumber + 1 + idx;
                    return (
                      <TableHead
                        key={gw}
                        className="w-28 font-medium text-center border-[0.5rem] border-white rounded-[1rem] p-0 px-1 py-1 md:p-4"
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.25 }}
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
                  <TableCell className="w-40 font-medium text-center border-[0.5rem] border-white rounded-[1rem] px-1 py-1 md:p-4">
                    <span className="hidden md:inline">{team.name}</span>
                    <span className="md:hidden">{team.short_name}</span>
                  </TableCell>
                  <AnimatePresence initial={false}>
                    {[...Array(numWeeks)].map((_, weekIdx) => {
                      const gw = currentGwNumber + 1 + weekIdx;
                      const { fixtureText, difficulty } =
                        getFixture({ teamId: team.id, gw }) || {};
                      const isTeamPlanned = returnIsTeamPlanned(team.id);
                      const isPreviouslyPredicted = returnIsPreviouslyPredicted(
                        team.id
                      );
                      const isTeamPlannedThisGw = picks[gw] === team.id;

                      const className = getClassName(
                        isTeamPlannedThisGw,
                        isPreviouslyPredicted,
                        isTeamPlanned,
                        fixtureText,
                        difficulty
                      );

                      return (
                        <TableCell
                          key={`${team.id}-${gw}`}
                          className={`${className} w-28 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white rounded-[1rem]`}
                          aria-disabled={isPreviouslyPredicted || !fixtureText}
                          onClick={() =>
                            !isPreviouslyPredicted &&
                            fixtureText &&
                            handlePick(team.id, gw)
                          }
                          tabIndex={
                            isPreviouslyPredicted || !fixtureText ? -1 : 0
                          }
                          aria-pressed={isTeamPlannedThisGw}
                          aria-label={
                            fixtureText
                              ? `GW ${gw}, ${team.name}, ${fixtureText}${isPreviouslyPredicted ? ', already used' : ''}`
                              : `GW ${gw}, ${team.name}, no fixture`
                          }
                          onKeyDown={(e) => {
                            if (
                              (e.key === 'Enter' || e.key === ' ') &&
                              !isPreviouslyPredicted &&
                              fixtureText
                            ) {
                              e.preventDefault();
                              handlePick(team.id, gw);
                            }
                          }}
                        >
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                          >
                            {fixtureText || '-'}
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
