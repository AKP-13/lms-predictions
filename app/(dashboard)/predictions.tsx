import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';

export type TeamName =
  | 'Arsenal'
  | 'Aston Villa'
  | 'Bournemouth'
  | 'Brentford'
  | 'Brighton'
  | 'Burnely'
  | 'Chelsea'
  | 'Crystal Palace'
  | 'Fulham'
  | 'Leeds'
  | 'Liverpool'
  | 'Man City'
  | 'Man Utd'
  | 'Newcastle'
  | 'Nottingham Forest'
  | 'Spurs'
  | 'Sunderland'
  | 'West Ham'
  | 'Wolves';

type Result = 'Win' | 'Draw';

const teams: TeamName[] = [
  'Arsenal',
  'Aston Villa',
  'Bournemouth',
  'Brentford',
  'Brighton',
  'Burnely',
  'Chelsea',
  'Crystal Palace',
  'Fulham',
  'Leeds',
  'Liverpool',
  'Man City',
  'Man Utd',
  'Newcastle',
  'Nottingham Forest',
  'Spurs',
  'Sunderland',
  'West Ham',
  'Wolves'
];

const results: Result[] = ['Win', 'Draw'];

const Predictions = () => {
  return (
    <Card className="rounded-xl bg-white p-2 shadow-sm">
      <CardHeader>
        <CardTitle>Predictions</CardTitle>
        <CardDescription>
          Make your prediction for this gameweek
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="my-4">
          <label htmlFor="team">Choose a team:</label>
          <Select name="team" id="team" options={teams} />
        </div>

        <div className="my-4">
          <label htmlFor="result">Choose a result:</label>
          <Select name="result" id="result" options={results} />
        </div>

        <button type="submit" disabled style={{ color: 'gray' }}>
          Submit
        </button>
      </CardContent>
    </Card>
  );
};

export default Predictions;
