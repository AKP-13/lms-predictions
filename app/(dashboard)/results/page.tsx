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
  TeamName
} from '@/components/ui/table';
import { fetchResultsData } from '@/lib/data';

const PredictionsPage = async () => {
  const results = await fetchResultsData();

  const maxGameWeeks = Array.isArray(Object.values(results))
    ? Object.values(results).reduce(
        (maxLength, currentArray) => Math.max(maxLength, currentArray.length),
        0
      )
    : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>View your previous results</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              {Array.from(Array(maxGameWeeks)).map((_, gameWeek) => (
                <TableHead
                  key={`gw-headcell-${gameWeek + 1}`}
                >{`GW${gameWeek + 1}`}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(results).map((gameResults, gameIdx) => (
              <TableRow key={`game-row-${gameResults[0].game_id}`}>
                <TableCell className="font-medium">{gameIdx + 1}</TableCell>
                {gameResults.map((prediction, predictionIdx) => (
                  <TableCell
                    key={`gw-cell-${gameIdx}-${predictionIdx}`}
                    className={`table-cell ${prediction.correct ? 'bg-green-200' : 'bg-red-200'}`}
                  >
                    <TeamName location="Home" prediction={prediction} /> v{' '}
                    <TeamName location="Away" prediction={prediction} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PredictionsPage;
