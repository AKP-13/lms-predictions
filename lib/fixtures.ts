import { FixturesData } from './definitions';

export type FixturesByDate = Record<string, FixturesData[]>;

export const formatFixtureDate = (kickoffTime: string): string =>
  new Date(kickoffTime).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });


export const formatKickoffTime = (kickoffTime: string): string =>
  new Date(kickoffTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });


export const groupFixturesByDate = (
  fixtures: FixturesData[],
  gameweek: number
): FixturesByDate =>
  fixtures.reduce(
    (acc, fixture) => {
      if (fixture.event !== gameweek) return acc;
      const date = formatFixtureDate(fixture.kickoff_time);
      if (!acc[date]) acc[date] = [];
      acc[date].push(fixture);
      return acc;
    },
    {} as FixturesByDate
  );

export const getSortedDates = (
  fixturesByDate: FixturesByDate
): string[] =>
  Object.keys(fixturesByDate).sort((a, b) => {
    const timeA = new Date(fixturesByDate[a][0].kickoff_time).getTime();
    const timeB = new Date(fixturesByDate[b][0].kickoff_time).getTime();
    return timeA - timeB;
  });
