import { X } from 'lucide-react';
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
import { CurrentGameResults } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import {
  COLUMN_HEADER_CLASSES,
  MatchLines,
  OUTCOMES,
  ROW_CLASSES
} from './results-table';

const MESSAGE_CLASSES = 'px-3 py-2 text-[0.9375rem] leading-[1.375rem]';

const editHref = `mailto:${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}?subject=Last%20Player%20Standing%20Prediction%20&body=I%20would%20like%20to%20edit%20my%20prediction%20to...`;

function RoundCell({ pick }: { pick: CurrentGameResults }) {
  const outcome =
    pick.correct === true
      ? OUTCOMES.safe
      : pick.correct === false
        ? OUTCOMES.out
        : undefined;

  return (
    <TableCell
      className={cn(
        'space-y-0.5 rounded-[0.875rem] px-3 py-2 align-top',
        outcome ? outcome.cellClasses : 'bg-chip'
      )}
    >
      <MatchLines pick={pick} outcome={outcome} />
      {!outcome && (
        <p className="flex items-center justify-between gap-2 pt-0.5 text-xs font-bold leading-4">
          <span className="text-muted-foreground">Pending</span>
          <a
            href={editHref}
            className="text-primary underline-offset-4 hover:underline"
          >
            Edit
          </a>
        </p>
      )}
    </TableCell>
  );
}

const CurrentGame = ({
  currentGameResults,
  leagueName,
  isLoading,
  isSignedIn
}: {
  currentGameResults: CurrentGameResults[];
  leagueName: null | string | { error: string };
  isLoading: boolean;
  isSignedIn: boolean;
}) => {
  const isOut = currentGameResults.some((pick) => pick.correct === false);

  return (
    <Card
      className={cn(isLoading && 'animate-pulse')}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="space-y-0.5 p-5 pb-1.5 md:p-7 md:pb-1.5">
        <CardTitle>Current game</CardTitle>
        <CardDescription>
          {`Your results from this game ${currentGameResults.length === 0 ? 'will be displayed here.' : ''}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-3 pb-3 md:px-5 md:pb-5">
        {isLoading ? (
          <div aria-hidden="true" className="flex gap-2 overflow-hidden p-2">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-[3.25rem] w-40 shrink-0 rounded-[0.875rem] bg-chip"
              />
            ))}
          </div>
        ) : !isSignedIn ? (
          <p className={cn(MESSAGE_CLASSES, 'text-center')}>
            <a
              className="font-bold text-primary underline-offset-4 hover:underline"
              href="/login"
            >
              Sign in to get started
            </a>
          </p>
        ) : leagueName === null ? (
          <p className={MESSAGE_CLASSES}>Join a league to get started.</p>
        ) : currentGameResults.length === 0 ? (
          <p className={MESSAGE_CLASSES}>
            Submit a prediction to begin seeing results here.
          </p>
        ) : (
          <>
            <Table
              className="w-auto table-fixed border-separate border-spacing-2"
              // Each round keeps about 168 px, so a narrow card scrolls sideways.
              style={{ width: `${currentGameResults.length * 10.5}rem` }}
            >
              <TableHeader className="[&_tr]:border-0">
                <TableRow className={ROW_CLASSES}>
                  {currentGameResults.map((pick) => (
                    <TableHead
                      key={pick.round_number}
                      className={COLUMN_HEADER_CLASSES}
                    >{`Round ${pick.round_number}`}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className={ROW_CLASSES}>
                  {currentGameResults.map((pick) => (
                    <RoundCell key={pick.round_number} pick={pick} />
                  ))}
                </TableRow>
              </TableBody>
            </Table>
            {isOut && (
              <p className="mx-2 mt-1 flex items-center gap-2.5 rounded-2xl bg-destructive-bg px-3.5 py-3 text-sm font-bold leading-[1.1875rem] text-destructive">
                <X aria-hidden="true" className="size-4 shrink-0" strokeWidth={3} />
                You are eliminated and will get an email when the new game
                starts.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentGame;
