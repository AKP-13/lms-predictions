import {
  ChangeEvent,
  CSSProperties,
  Dispatch,
  FC,
  SetStateAction,
  useMemo,
  useState
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { SignInPrompt } from '@/components/sign-in-prompt';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toneClasses } from '@/components/ui/tones';
import { FixturesData, Results } from '@/lib/definitions';
import { TeamsArr } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Session } from 'next-auth';

const NEUTRAL_DIFFICULTY = 3;

const DIFFICULTY_CLASSES: { [key: number]: string } = {
  1: 'bg-difficulty-easiest text-difficulty-easiest-foreground',
  2: 'bg-difficulty-easy text-difficulty-easy-foreground',
  3: 'bg-difficulty-neutral text-difficulty-neutral-foreground',
  4: 'bg-difficulty-hard text-difficulty-hard-foreground',
  5: 'bg-difficulty-hardest text-difficulty-hardest-foreground'
};

const PLANNED_CLASSES = cn(toneClasses.tint, 'ring-2 ring-inset ring-primary');
const USED_CLASSES =
  'border-[1.5px] border-dashed border-muted-foreground/40 font-bold text-muted-foreground opacity-75';
const SWATCH_CLASSES = 'block size-3.5 rounded-[5px]';
// The shadow fills the cell gaps and the card padding, so scrolled cells do not show through.
const STICKY_CLASSES =
  'sticky left-1.5 z-10 bg-card shadow-[0_0_0_6px_hsl(var(--card)),-14px_0_0_6px_hsl(var(--card))] md:shadow-[0_0_0_6px_hsl(var(--card)),-18px_0_0_6px_hsl(var(--card))]';

const WEEK_OPTIONS = ['5', '6', '7', '8', '9', '10'];

interface PickPlannerProps {
  teams: TeamsArr;
  fixtures: FixturesData[];
  predictionGwNumber: number | null;
  isPastSubmissionDeadline: boolean;
  numWeeks?: number;
  setNumWeeks?: Dispatch<SetStateAction<number>>;
  results: Record<number, Results[]>;
  session: Session | null;
  currentGameId: number | null;
}

const WeekPicker = ({
  numWeeks,
  setNumWeeks,
  isLoading
}: {
  numWeeks: number;
  setNumWeeks: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
}) => (
  <div className="relative flex h-8 shrink-0 items-center rounded-full bg-chip text-[0.8125rem] font-extrabold focus-within:ring-2 focus-within:ring-ring">
    <label htmlFor="week-picker" className="cursor-pointer pl-3 pr-1">
      Weeks
    </label>
    <select
      id="week-picker"
      value={String(numWeeks)}
      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
        setNumWeeks(Number(e.target.value))
      }
      disabled={isLoading}
      className="h-full cursor-pointer appearance-none rounded-r-full bg-transparent pl-0.5 pr-7 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      {WEEK_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-2.5 size-3.5"
      strokeWidth={2.5}
    />
  </div>
);

const PlannerKey = () => (
  <ul
    aria-label="Key"
    className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-2 text-xs font-bold text-muted-foreground"
  >
    <li className="flex items-center gap-1.5">
      <span className="sr-only">Difficulty, from</span>
      Easy
      {[1, 2, 3, 4, 5].map((difficulty) => (
        <i
          key={difficulty}
          aria-hidden="true"
          className={cn(
            SWATCH_CLASSES,
            DIFFICULTY_CLASSES[difficulty],
            difficulty === NEUTRAL_DIFFICULTY && 'ring-1 ring-inset ring-border'
          )}
        />
      ))}
      <span className="sr-only">to</span>
      Hard
    </li>
    <li className="flex items-center gap-1.5">
      <i aria-hidden="true" className={cn(SWATCH_CLASSES, PLANNED_CLASSES)} />
      Planned
    </li>
    <li className="flex items-center gap-1.5">
      <i aria-hidden="true" className={cn(SWATCH_CLASSES, USED_CLASSES)} />
      Used
    </li>
  </ul>
);

const PickPlanner: FC<PickPlannerProps> = ({
  teams,
  fixtures,
  predictionGwNumber,
  isPastSubmissionDeadline,
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

    const map = new Map<
      string,
      {
        fixtureText: string;
        opponentShortName: string;
        location: 'H' | 'A';
        difficulty: number;
      }
    >();

    fixtures.forEach((fixture) => {
      const { event, team_h, team_a, team_h_difficulty, team_a_difficulty } =
        fixture;

      // Home team - O(1) lookup
      const homeOpponent = teamsById.get(team_a);
      if (homeOpponent) {
        map.set(`${event}-${team_h}`, {
          fixtureText: `${homeOpponent.name} (H)`,
          opponentShortName: homeOpponent.short_name,
          location: 'H',
          difficulty: team_h_difficulty
        });
      }

      // Away team - O(1) lookup
      const awayOpponent = teamsById.get(team_h);
      if (awayOpponent) {
        map.set(`${event}-${team_a}`, {
          fixtureText: `${awayOpponent.name} (A)`,
          opponentShortName: awayOpponent.short_name,
          location: 'A',
          difficulty: team_a_difficulty
        });
      }
    });

    return map;
  }, [fixtures, teams]);

  // Create O(1) lookups for the player's submitted picks: the round in which
  // they used each team, and which team they used in each gameweek
  const { usedRoundByTeamId, submittedTeamIdByGw } = useMemo(() => {
    const previousPicks =
      typeof currentGameId === 'number' ? (results[currentGameId] ?? []) : [];

    // Create a Map of teams indexed by name for O(1) lookups
    const teamsByName = new Map(teams.map((team) => [team.name, team]));

    const roundByTeamId = new Map<number, number>();
    const teamIdByGw = new Map<number, number>();

    previousPicks.forEach((pick) => {
      const team = teamsByName.get(pick?.team_selected);
      if (!team) return;

      roundByTeamId.set(team.id, pick.round_number);
      if (pick.fpl_gw !== null) teamIdByGw.set(pick.fpl_gw, team.id);
    });

    return {
      usedRoundByTeamId: roundByTeamId,
      submittedTeamIdByGw: teamIdByGw
    };
  }, [currentGameId, results, teams]);

  // The gameweeks the planner shows: the one being predicted for, then the next
  // consecutive ones
  const plannerGameweeks = useMemo(
    () =>
      predictionGwNumber === null
        ? []
        : Array.from(
            { length: numWeeks },
            (_, idx) => predictionGwNumber + idx
          ),
    [predictionGwNumber, numWeeks]
  );

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
    usedRoundByTeamId.has(teamId);

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

  // The note under a team name: the player's pick, a planned pick, or a used team.
  const getTeamNote = (teamId: number) => {
    const isSubmittedInPlanner = plannerGameweeks.some(
      (gw) => submittedTeamIdByGw.get(gw) === teamId
    );
    if (isSubmittedInPlanner) return { text: 'Your pick', isUsed: false };
    if (returnIsTeamPlanned(teamId)) return { text: 'Planned', isUsed: false };
    const usedRound = usedRoundByTeamId.get(teamId);
    if (usedRound !== undefined)
      return { text: `Used in round ${usedRound}`, isUsed: true };
    return null;
  };

  const getCellClasses = ({
    isMine,
    isDashed,
    fixtureText,
    difficulty
  }: {
    isMine: boolean;
    isDashed: boolean;
    fixtureText: string | undefined;
    difficulty: number | undefined;
  }) => {
    if (isMine) return PLANNED_CLASSES;
    if (isDashed) return USED_CLASSES;
    if (!fixtureText) return 'text-muted-foreground';
    return (
      DIFFICULTY_CLASSES[difficulty ?? NEUTRAL_DIFFICULTY] ??
      DIFFICULTY_CLASSES[NEUTRAL_DIFFICULTY]
    );
  };

  return (
    <Card aria-busy={isLoading} aria-live="polite">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-5 pb-0 md:p-6 md:pb-0">
        <div className="space-y-0.5">
          <CardTitle>Pick Planner</CardTitle>
          <CardDescription>
            {plannerGameweeks.length > 0
              ? `GW${plannerGameweeks[0]} – GW${plannerGameweeks[plannerGameweeks.length - 1]}`
              : 'Plan your picks.'}
          </CardDescription>
        </div>
        {setNumWeeks && session && (
          <WeekPicker
            numWeeks={numWeeks}
            setNumWeeks={setNumWeeks}
            isLoading={isLoading}
          />
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
        {session && <PlannerKey />}

        {isLoading ? (
          // Loading skeleton
          <div aria-hidden="true" className="mt-3 animate-pulse space-y-1.5">
            {[0, 1, 2, 3].map((rowIdx) => (
              <div className="flex gap-1.5" key={`skeleton-row-${rowIdx}`}>
                {[...Array(6)].map((_, colIdx) => (
                  <div
                    key={`skeleton-cell-${rowIdx}-${colIdx}`}
                    className="h-[2.125rem] flex-1 rounded-[0.625rem] bg-chip"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : session === null ? (
          <SignInPrompt className="pt-3" />
        ) : fixtures.length === 0 || predictionGwNumber === null ? (
          <p className="pt-3 text-center text-muted-foreground">
            The site is being updated. Please check back later.
          </p>
        ) : (
          // With many weeks, the table scrolls sideways inside the card.
          // contain stops the table width from widening the page.
          <div className="-mx-5 mt-2 overflow-x-auto px-3.5 [contain:inline-size] md:-mx-6 md:px-[1.125rem]">
            <table
              className="w-full min-w-[calc(5.75rem+var(--weeks)*4.875rem)] table-fixed border-separate border-spacing-1.5 lg:min-w-[calc(10.625rem+var(--weeks)*7.375rem)]"
              style={{ '--weeks': numWeeks } as CSSProperties}
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    className={cn(
                      STICKY_CLASSES,
                      'w-[5.75rem] text-left text-[0.8125rem] font-semibold text-muted-foreground lg:w-[10.625rem]'
                    )}
                  >
                    Team
                  </th>
                  <AnimatePresence initial={false}>
                    {plannerGameweeks.map((gw) => (
                      <th
                        key={gw}
                        scope="col"
                        className="text-center text-[0.8125rem] font-semibold text-muted-foreground"
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
                      </th>
                    ))}
                  </AnimatePresence>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => {
                  const note = getTeamNote(team.id);

                  return (
                    <tr key={team.id}>
                      <th
                        scope="row"
                        className={cn(
                          STICKY_CLASSES,
                          'pr-1 text-left text-[0.8125rem] font-bold lg:text-sm'
                        )}
                      >
                        <span
                          className={cn(
                            'block truncate',
                            note?.isUsed && 'text-muted-foreground'
                          )}
                        >
                          {team.name}
                        </span>
                        {note && (
                          <span
                            className={cn(
                              'block truncate text-[0.6875rem]',
                              note.isUsed
                                ? 'text-muted-foreground'
                                : 'text-primary'
                            )}
                          >
                            {note.text}
                          </span>
                        )}
                      </th>
                      <AnimatePresence initial={false}>
                        {plannerGameweeks.map((gw) => {
                          const fixtureData = getFixture({
                            teamId: team.id,
                            gw
                          });
                          const {
                            fixtureText,
                            opponentShortName,
                            location,
                            difficulty
                          } = fixtureData || {};
                          const isTeamPlanned = returnIsTeamPlanned(team.id);
                          const isPreviouslyPredicted =
                            returnIsPreviouslyPredicted(team.id);
                          const isTeamPlannedThisGw = picks[gw] === team.id;

                          // Once the deadline passes, the gameweek being predicted
                          // for is settled - show it, but take no more input
                          const isLockedColumn =
                            isPastSubmissionDeadline &&
                            gw === predictionGwNumber;
                          const isSubmittedThisGw =
                            submittedTeamIdByGw.get(gw) === team.id;
                          const isInteractive =
                            !isLockedColumn &&
                            !isPreviouslyPredicted &&
                            !!fixtureText;
                          const isMine =
                            isSubmittedThisGw || isTeamPlannedThisGw;

                          return (
                            <td key={`${team.id}-${gw}`} className="p-0">
                              <button
                                type="button"
                                disabled={!isInteractive}
                                onClick={() => handlePick(team.id, gw)}
                                aria-pressed={isMine}
                                aria-label={
                                  fixtureText
                                    ? `GW ${gw}, ${team.name}, ${fixtureText}${isSubmittedThisGw ? ', submitted' : isPreviouslyPredicted ? ', already used' : ''}${isLockedColumn ? ', locked' : ''}`
                                    : `GW ${gw}, ${team.name}, no fixture`
                                }
                                className={cn(
                                  'flex h-[2.125rem] w-full items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[0.625rem] px-1 text-[0.6875rem] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed lg:h-[2.375rem] lg:text-xs',
                                  getCellClasses({
                                    isMine,
                                    // Used earlier, or planned for another week.
                                    isDashed:
                                      isPreviouslyPredicted ||
                                      (isTeamPlanned && !isTeamPlannedThisGw),
                                    fixtureText,
                                    difficulty
                                  })
                                )}
                              >
                                <motion.span
                                  layout
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 4 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex min-w-0 items-center gap-1"
                                >
                                  {isMine && (
                                    <Check
                                      aria-hidden="true"
                                      className="size-3 shrink-0"
                                      strokeWidth={3}
                                    />
                                  )}
                                  {fixtureText ? (
                                    <>
                                      {/* From lg: the full name */}
                                      <span className="hidden truncate lg:inline">
                                        {fixtureText}
                                      </span>
                                      {/* Below lg: the short name */}
                                      <span className="truncate lg:hidden">
                                        {opponentShortName} ({location})
                                      </span>
                                    </>
                                  ) : (
                                    '–'
                                  )}
                                </motion.span>
                              </button>
                            </td>
                          );
                        })}
                      </AnimatePresence>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PickPlanner;
