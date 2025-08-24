import { FixturesData } from '@/lib/definitions';

const TeamForm = ({
  teamId,
  fixtures,
  selectedGw
}: {
  fixtures: FixturesData[] | 'The game is being updated';
  teamId: number;
  selectedGw: number;
}) => {
  const filteredFixtures = Array.isArray(fixtures)
    ? fixtures.filter(
        (fixture) =>
          fixture.event < selectedGw &&
          (fixture.team_a === teamId || fixture.team_h === teamId)
      )
    : [];

  const resultsArr = filteredFixtures.reduce(
    (acc: ('W' | 'D' | 'L')[], curr) => {
      if (curr.team_a === teamId) {
        const result =
          curr.team_a_score > curr.team_h_score
            ? 'W'
            : curr.team_a_score === curr.team_h_score
              ? 'D'
              : 'L';
        acc.push(result);
      } else {
        const result =
          curr.team_h_score > curr.team_a_score
            ? 'W'
            : curr.team_h_score === curr.team_a_score
              ? 'D'
              : 'L';
        acc.push(result);
      }
      return acc;
    },
    []
  );

  return (
    <>
      <div className="flex-0.5 hidden md:block font-light italic space-x-2">
        {resultsArr.slice(-5).map((result, idx) => (
          <span
            key={teamId + result + idx}
            className="inline-block text-center"
            style={{
              width: '1rem',
              color:
                result === 'W'
                  ? '#22c55e'
                  : result === 'D'
                    ? '#64748b'
                    : '#ef4444',
              fontWeight: '500'
            }}
          >
            {result}
          </span>
        ))}
      </div>
      <div className="flex-0.5 block md:hidden font-light italic space-x-2">
        {resultsArr.slice(-5).map((result, idx) => (
          <span
            key={teamId + result + idx}
            className="inline-block text-center"
            style={{
              width: '1rem',
              color:
                result === 'W'
                  ? '#22c55e'
                  : result === 'D'
                    ? '#64748b'
                    : '#ef4444',
              fontWeight: '500'
            }}
          >
            {result}
          </span>
        ))}
      </div>
    </>
  );
};

export { TeamForm };
