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
import { Button } from '@/components/ui/button';

type Outcome = 'Win' | 'Draw';

type Props = {
  results: Record<number, Results[]>;
  teamsArr: TeamsArr;
};

const outcome: Outcome[] = ['Win', 'Draw'];

const Predictions = async ({ results, teamsArr }: Props) => {
  const session = await auth();

  // Find the latest gameweek by key (maximum number)
  const gameweekNumbers = Object.keys(results).map(Number);
  const latestGameweek = Math.max(...gameweekNumbers);
  const previousPicksArr =
    results[latestGameweek]?.map((val) => val?.team_selected) ?? [];

  const teams = teamsArr.map(({ name }) => name);

  return (
    <Card className="rounded-xl bg-white p-2 my-8 shadow-sm overflow-auto">
      <CardHeader>
        <CardTitle>Prediction</CardTitle>
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
          <div className="flex flex-col">
            <div className="flex">
              <div className="my-4 mr-2 flex flex-col items-center w-full">
                <label htmlFor="team">Team</label>
                <Select
                  name="team"
                  id="team"
                  options={teams}
                  disabledOptions={previousPicksArr}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="my-4 ml-2 flex flex-col items-center w-full">
                <label htmlFor="outcome">Outcome</label>
                <Select
                  name="outcome"
                  id="outcome"
                  options={outcome}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <Button type="submit">Submit Prediction</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Predictions;
