import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';

type Team =
  | 'Arsenal'
  | 'Aston Villa'
  | 'Bournemouth'
  | 'Brentford'
  | 'Brighton'
  | 'Chelsea'
  | 'Crystal Palace'
  | 'Fulham'
  | 'Ipswich'
  | 'Leicester'
  | 'Liverpool'
  | 'Man City'
  | 'Man Utd'
  | 'Newcastle'
  | 'Nottingham Forest'
  | 'Southampton'
  | 'Spurs'
  | 'West Ham'
  | 'Wolves';

type Result = 'Win' | 'Draw';

const teams: Team[] = [
  'Arsenal',
  'Aston Villa',
  'Bournemouth',
  'Brentford',
  'Brighton',
  'Chelsea',
  'Crystal Palace',
  'Fulham',
  'Ipswich',
  'Leicester',
  'Liverpool',
  'Man City',
  'Man Utd',
  'Newcastle',
  'Nottingham Forest',
  'Southampton',
  'Spurs',
  'West Ham',
  'Wolves'
];

const results: Result[] = ['Win', 'Draw'];

const PredictionsPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictions</CardTitle>
        <CardDescription>
          Make your prediction for this gameweek.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <label htmlFor="team">Choose a team:</label>
        <Select name="team" id="team" options={teams} />

        <label htmlFor="result">Choose a result:</label>
        <Select name="result" id="result" options={results} />
      </CardContent>
    </Card>
  );
};

export default PredictionsPage;
