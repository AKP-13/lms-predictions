import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { auth } from '@/lib/auth';
import { TeamsArr } from './page';
import { Results } from '@/lib/definitions';

type Result = 'Win' | 'Draw';

type Props = {
  results: Record<number, Results[]>;
  teamsArr: TeamsArr;
};

const outcome: Result[] = ['Win', 'Draw'];

const Predictions = async ({ results, teamsArr }: Props) => {
  const session = await auth();

  // Find the latest gameweek by key (maximum number)
  const gameweekNumbers = Object.keys(results).map(Number);
  const latestGameweek = Math.max(...gameweekNumbers);
  const previousPicksArr =
    results[latestGameweek]?.map((val) => val?.team_selected) ?? [];

  const teams = teamsArr.map(({ name }) => name);

  return (
    <Card className="rounded-xl bg-white p-2 shadow-sm">
      <CardHeader>
        <CardTitle>Predictions</CardTitle>
        <CardDescription>
          Make your prediction for this gameweek
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
        ) : (
          <>
            <div className="my-4">
              <label htmlFor="team">Choose a team:</label>
              <Select
                name="team"
                id="team"
                options={teams}
                disabledOptions={previousPicksArr}
              />
            </div>

            <div className="my-4">
              <label htmlFor="result">Choose a result:</label>
              <Select name="result" id="result" options={outcome} />
            </div>

            <button type="submit" disabled style={{ color: 'gray' }}>
              Submit
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Predictions;
