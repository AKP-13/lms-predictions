import { Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { Loader } from 'lucide-react';
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
  TableRow,
  TeamName,
  TeamScore
} from '@/components/ui/table';
import { CurrentGameResults } from '@/lib/definitions';

const CurrentGame = ({
  currentGameResults,
  leagueName,
  isLoading
}: {
  currentGameResults: CurrentGameResults[];
  leagueName: null | string | { error: string };
  isLoading: boolean;
}) => {
  const { data: session } = useSession();

  const isLoadingCombined = isLoading;

  return (
    <Card
      className={`rounded-xl bg-white p-2 shadow-sm overflow-auto ${isLoadingCombined ? 'animate-pulse' : ''}`}
      aria-busy={isLoadingCombined}
      aria-live="polite"
    >
      <CardHeader className="p-2 md:p-6">
        <CardTitle className="flex flex-col md:flex-row md:items-center">
          <span>Current Game</span>
          {isLoadingCombined ? (
            <Loader className="animate-spin mx-2" aria-hidden="true" />
          ) : typeof leagueName === 'string' ? (
            <span style={{ fontStyle: 'italic' }} className="md:ml-1">
              <span className="hidden md:inline"> - </span>
              {leagueName}
            </span>
          ) : (
            ''
          )}
        </CardTitle>
        <CardDescription>
          {`Your results from this game ${currentGameResults.length === 0 ? 'will be displayed here.' : ''}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-2 md:p-6 md:pt-0">
        {isLoadingCombined ? (
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
        ) : session === null || session === undefined ? (
          // Sign in prompt
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              style={{ color: 'blue', fontWeight: 600, textAlign: 'center' }}
              href="/api/auth/signin"
            >
              Sign in to get started
            </a>
          </div>
        ) : leagueName === null ? (
          // Join league prompt
          'Join a league to get started.'
        ) : currentGameResults.length === 0 ? (
          // Submit prediction prompt
          'Submit a prediction to begin seeing results here.'
        ) : (
          // Current game table
          <Table>
            <TableHeader>
              <TableRow>
                {currentGameResults.map((_, round) => (
                  <TableHead
                    key={`gw-headcell-${round + 1}`}
                  >{`Round ${round + 1}`}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {currentGameResults.map((prediction, gameIdx) => (
                  <Fragment key={`gw-fragment-${gameIdx}`}>
                    <TableCell
                      className={`table-cell ${prediction.correct === true ? 'bg-green-200' : prediction.correct === false ? 'bg-red-200' : 'bg-gray-200'}`}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          textAlign: 'center',
                          minWidth: '4rem',
                          maxWidth: '9rem'
                        }}
                      >
                        <div>
                          <TeamName location="Home" prediction={prediction} /> v{' '}
                          <TeamName location="Away" prediction={prediction} />
                        </div>
                        {prediction.correct === null ? (
                          <a
                            href={`mailto:${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}?subject=Last%20Player%20Standing%20Prediction%20&body=I%20would%20like%20to%20edit%20my%20prediction%20to...`}
                            style={{
                              color: 'blue',
                              textDecoration: 'underline',
                              fontWeight: 600
                            }}
                          >
                            Edit
                          </a>
                        ) : (
                          <div>
                            <TeamScore
                              location="Home"
                              prediction={prediction}
                            />{' '}
                            <span className="font-thin">v</span>{' '}
                            <TeamScore
                              location="Away"
                              prediction={prediction}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {prediction.correct === false && (
                      <TableCell
                        key={`gw-cell-lost-${gameIdx}`}
                        className="table-cell"
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            textAlign: 'center',
                            width: '100%'
                          }}
                        >
                          <span>
                            You are eliminated and will get an email when the
                            new game starts.
                          </span>
                        </div>
                      </TableCell>
                    )}
                  </Fragment>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentGame;
