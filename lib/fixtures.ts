import { FixturesData } from './definitions';

export type FixturesByDate = Record<string, FixturesData[]>;

export function formatFixtureDate(kickoffTime: string): string {
  return new Date(kickoffTime).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function formatKickoffTime(kickoffTime: string): string {
  return new Date(kickoffTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function groupFixturesByDate(
  fixtures: FixturesData[],
  gameweek: number
): FixturesByDate {
  return fixtures.reduce(
    (acc, fixture) => {
      if (fixture.event !== gameweek) return acc;
      const date = formatFixtureDate(fixture.kickoff_time);
      if (!acc[date]) acc[date] = [];
      acc[date].push(fixture);
      return acc;
    },
    {} as FixturesByDate
  );
}

export function getSortedDates(
  fixturesByDate: FixturesByDate
): string[] {
  return Object.keys(fixturesByDate).sort((a, b) => {
    const timeA = new Date(fixturesByDate[a][0].kickoff_time).getTime();
    const timeB = new Date(fixturesByDate[b][0].kickoff_time).getTime();
    return timeA - timeB;
  });
}
