import { Check, X } from 'lucide-react';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { Badge } from '@/components/ui/badge';
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
import { Results } from '@/lib/definitions';
import { cn } from '@/lib/utils';

export const ROW_CLASSES = 'border-0 hover:bg-transparent';
export const COLUMN_HEADER_CLASSES =
  'h-auto px-1 align-bottom text-[0.8125rem] font-semibold';
const GAME_COLUMN_CLASSES = 'w-11 px-0 md:w-[3.25rem] md:pl-1';

// Each round keeps about 168 px, so a narrow card scrolls sideways.
export const ROUND_WIDTH_REM = 10.5;

export const PICK_RESULTS = {
  safe: {
    label: 'Safe',
    Icon: Check,
    badge: 'success',
    iconClasses: 'text-success',
    cellClasses: 'bg-success-bg'
  },
  out: {
    label: 'Out',
    Icon: X,
    badge: 'destructive',
    iconClasses: 'text-destructive',
    cellClasses: 'bg-destructive-bg'
  }
} as const;

type PickResult = (typeof PICK_RESULTS)[keyof typeof PICK_RESULTS];

type Match = Pick<
  Results,
  | 'team_selected'
  | 'team_opposing'
  | 'team_selected_location'
  | 'team_selected_score'
  | 'team_opposing_score'
>;

function TeamLine({
  name,
  score,
  isPicked,
  result
}: {
  name: string;
  score: number;
  isPicked: boolean;
  result?: PickResult;
}) {
  const Name = isPicked ? 'strong' : 'span';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-[0.8125rem] leading-[1.125rem]',
        isPicked
          ? 'font-extrabold text-foreground'
          : 'font-semibold text-muted-foreground'
      )}
    >
      <Name className="min-w-0 flex-1 truncate">{name}</Name>
      {isPicked && result && (
        <result.Icon
          role="img"
          aria-label={result.label}
          className={cn('size-3 shrink-0', result.iconClasses)}
          strokeWidth={3}
        />
      )}
      {result && (
        <span className="min-w-2.5 text-right font-extrabold">{score}</span>
      )}
    </div>
  );
}

/** Shows the home team above the away team. Without a result, it hides the scores. */
function MatchLines({ pick, result }: { pick: Match; result?: PickResult }) {
  const picked = {
    name: pick.team_selected,
    score: pick.team_selected_score,
    isPicked: true
  };
  const opposing = {
    name: pick.team_opposing,
    score: pick.team_opposing_score,
    isPicked: false
  };
  const [home, away] =
    pick.team_selected_location === 'Home'
      ? [picked, opposing]
      : [opposing, picked];

  return [home, away].map((team) => (
    <TeamLine key={team.name} {...team} result={result} />
  ));
}

// A pick with no result yet has the chip colour.
export function PickCell({
  pick,
  result,
  children
}: {
  pick: Match;
  result?: PickResult;
  children?: React.ReactNode;
}) {
  return (
    <TableCell
      className={cn(
        'space-y-0.5 rounded-[0.875rem] px-3 py-2 align-top',
        result ? result.cellClasses : 'bg-chip'
      )}
    >
      <MatchLines pick={pick} result={result} />
      {children}
    </TableCell>
  );
}

function ResultCell({ pick }: { pick: Results }) {
  // Bug #48: a pending pick has no result yet, but it shows as out.
  const result = pick.correct ? PICK_RESULTS.safe : PICK_RESULTS.out;

  return <PickCell pick={pick} result={result} />;
}

export function ResultsSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-2 overflow-hidden p-2">
      {[0, 1, 2].map((idx) => (
        <div
          key={idx}
          className="h-[3.25rem] w-40 shrink-0 rounded-[0.875rem] bg-chip"
        />
      ))}
    </div>
  );
}

function ResultsKey() {
  return (
    <ul aria-label="Key" className="flex gap-1.5">
      {Object.values(PICK_RESULTS).map(({ label, Icon, badge }) => (
        <li key={label}>
          <Badge
            variant={badge}
            className="h-6 gap-1 px-2.5 text-[0.6875rem] md:h-7 md:gap-1.5 md:px-3 md:text-xs"
          >
            <Icon aria-hidden="true" className="size-3" strokeWidth={3} />
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export function ResultsTable({
  results,
  isSignedIn,
  isLoading = false
}: {
  results: Record<number, Results[]>;
  isSignedIn: boolean;
  isLoading?: boolean;
}) {
  const games = Object.values(results);
  const roundCount = Math.max(0, ...games.map((game) => game.length));
  const rounds = Array.from({ length: roundCount }, (_, idx) => idx + 1);

  return (
    <Card
      className={cn(isLoading && 'animate-pulse')}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 pb-1.5 md:p-7 md:pb-1.5">
        <div className="space-y-0.5">
          <CardTitle>Results</CardTitle>
          <CardDescription>View your previous results</CardDescription>
        </div>
        {isSignedIn && !isLoading && <ResultsKey />}
      </CardHeader>

      <CardContent className="px-3 pb-3 md:px-5 md:pb-5">
        {isLoading ? (
          <ResultsSkeleton />
        ) : isSignedIn ? (
          <Table
            className="table-fixed border-separate border-spacing-2"
            style={{ minWidth: `${3.25 + roundCount * ROUND_WIDTH_REM}rem` }}
          >
            <TableHeader className="[&_tr]:border-0">
              <TableRow className={ROW_CLASSES}>
                <TableHead
                  className={cn(COLUMN_HEADER_CLASSES, GAME_COLUMN_CLASSES)}
                >
                  Game
                </TableHead>
                {rounds.map((round) => (
                  <TableHead
                    key={round}
                    className={COLUMN_HEADER_CLASSES}
                  >{`Round ${round}`}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game, gameIdx) => (
                <TableRow key={game[0].game_id} className={ROW_CLASSES}>
                  <TableHead
                    scope="row"
                    className={cn(
                      GAME_COLUMN_CLASSES,
                      'h-auto text-[0.9375rem] font-extrabold'
                    )}
                  >
                    {gameIdx + 1}
                  </TableHead>
                  {rounds.map((round, roundIdx) =>
                    game[roundIdx] ? (
                      <ResultCell key={round} pick={game[roundIdx]} />
                    ) : (
                      <TableCell key={round} className="p-0" />
                    )
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <SignInPrompt className="px-3 py-2" />
        )}
      </CardContent>
    </Card>
  );
}
