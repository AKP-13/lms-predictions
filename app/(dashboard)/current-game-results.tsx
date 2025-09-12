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
import { auth } from '@/lib/auth';
import { fetchCurrentGameData } from '@/lib/data';

const CurrentGameResults = async () => {
  const session = await auth();
  const currentGameResults = await fetchCurrentGameData({
    userId: session?.user?.id
  });

  return (
    <Card className="rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto">
      <CardHeader>
        <CardTitle>Current Game</CardTitle>
        <CardDescription>Your results from this game</CardDescription>
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
                  <>
                    <TableCell
                      key={`gw-cell-${gameIdx}`}
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
                          'Pending...'
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
                            minWidth: '4rem',
                            maxWidth: '9rem'
                          }}
                        >
                          <span>You're out of this game!</span>
                          <span>
                            You will get an email when the new game starts.
                          </span>
                        </div>
                      </TableCell>
                    )}
                  </>
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
