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
import { fetchCurrentGameData } from '@/lib/data';

const CurrentGameResults = async () => {
  const currentGameResults = await fetchCurrentGameData();

  return (
    <Card className="rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto">
      <CardHeader>
        <CardTitle>Current Game</CardTitle>
        <CardDescription>Your results from this game</CardDescription>
      </CardHeader>

      <CardContent>
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
                    className={`table-cell ${prediction.correct ? 'bg-green-200' : 'bg-red-200'}`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'center'
                      }}
                    >
                      <div>
                        <TeamName location="Home" prediction={prediction} /> v{' '}
                        <TeamName location="Away" prediction={prediction} />
                      </div>
                      <div>
                        <TeamScore location="Home" prediction={prediction} />{' '}
                        <span className="font-thin">v</span>{' '}
                        <TeamScore location="Away" prediction={prediction} />
                      </div>
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
                          textAlign: 'center'
                        }}
                      >
                        <span>
                          Unfortunetly, {prediction.team_selected} not getting a{' '}
                          {prediction.result_selected.toLowerCase()} against{' '}
                          {prediction.team_opposing} means that you're out of
                          this round!
                        </span>
                        <span>
                          You will get an email when the new round starts.
                        </span>
                      </div>
                    </TableCell>
                  )}
                </>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CurrentGameResults;
