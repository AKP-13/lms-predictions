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
import useCurrentGameData from 'app/hooks/useCurrentGameData';
import { useSession } from 'next-auth/react';
import { Fragment } from 'react';

const CurrentGameResults = ({
  leagueInfo,
  refreshTrigger
}: {
  leagueInfo: null | string;
  refreshTrigger: number;
}) => {
  const { data: session } = useSession();
  const { currentGameResults, isLoading } = useCurrentGameData({
    refreshTrigger
  });

  return (
    <Card className="rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto">
      <CardHeader>
        <CardTitle>
          Current Game{leagueInfo ? ` - ${leagueInfo}` : ''}
        </CardTitle>
        <CardDescription>
          {`Your results from this game ${currentGameResults.length === 0 ? 'will be displayed here.' : ''}`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {session === null ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              style={{ color: 'blue', fontWeight: 600, textAlign: 'center' }}
              href="/api/auth/signin"
            >
              Sign in to get started
            </a>
          </div>
        ) : leagueInfo === null ? (
          'Join a league to get started.'
        ) : currentGameResults.length === 0 ? (
          'Submit a prediction to begin seeing results here.'
        ) : (
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
                            href={`mailto:alexlmsapp@icloud.com?subject=Last%20Player%20Standing%20Prediction%20&body=I%20would%20like%20to%20edit%20my%20prediction%20to...`}
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

export default CurrentGameResults;
