import { X } from 'lucide-react';
import { messageBoxClassName } from '@/components/form-error';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { textLinkClassName } from '@/components/ui/button';
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
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toneClasses } from '@/components/ui/tones';
import { CurrentGameResults } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import {
  COLUMN_HEADER_CLASSES,
  PICK_RESULTS,
  PickCell,
  ROUND_WIDTH_REM,
  ROW_CLASSES,
  ResultsSkeleton
} from './results-table';

const MESSAGE_CLASSES = 'px-3 py-2 text-[0.9375rem] leading-[1.375rem]';

const editHref = `mailto:${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}?subject=Last%20Player%20Standing%20Prediction%20&body=I%20would%20like%20to%20edit%20my%20prediction%20to...`;

function RoundCell({ pick }: { pick: CurrentGameResults }) {
  const result =
    pick.correct === true
      ? PICK_RESULTS.safe
      : pick.correct === false
        ? PICK_RESULTS.out
        : undefined;

  return (
    <PickCell pick={pick} result={result}>
      {!result && (
        <p className="flex items-center justify-between gap-2 pt-0.5 text-xs font-bold leading-4">
          <span className="text-muted-foreground">Pending</span>
          <a href={editHref} className={textLinkClassName}>
            Edit
          </a>
        </p>
      )}
    </PickCell>
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
          <ResultsSkeleton />
        ) : !isSignedIn ? (
          <SignInPrompt className={MESSAGE_CLASSES} />
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
              style={{
                width: `${currentGameResults.length * ROUND_WIDTH_REM}rem`
              }}
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
              <p
                className={cn(
                  messageBoxClassName,
                  toneClasses.destructive,
                  'mx-2 mt-1'
                )}
              >
                <X
                  aria-hidden="true"
                  className="size-4 shrink-0"
                  strokeWidth={3}
                />
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
