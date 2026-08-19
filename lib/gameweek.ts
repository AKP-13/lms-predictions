import { MAX_GW, MIN_GW } from './constants';
import { FixturesData } from './definitions';

export type GameweekEvent = {
  id: number;
  is_current: boolean;
  is_next: boolean;
};

export const resolvePredictionGameweek = (
  events?: GameweekEvent[] | null
): number | null => {
  if (!events?.length) return null;

  const nextEvent = events.find((event) => event.is_next);
  if (nextEvent) return nextEvent.id;

  const currentEvent = events.find((event) => event.is_current);
  if (currentEvent) return Math.min(currentEvent.id + 1, MAX_GW);

  return null;
};

export const resolveResultsGameweek = (
  events?: GameweekEvent[] | null
): number => events?.find((event) => event.is_current)?.id ?? MIN_GW;

export const SUBMISSION_DEADLINE_OFFSET_MS = 2 * 60 * 60 * 1000; // 2 hours

export const returnIsPastSubmissionDeadline = ({
  predictionWeekFixtures
}: {
  predictionWeekFixtures: FixturesData[];
}) => {
  const currentDate = new Date().getTime();

  if (predictionWeekFixtures.length === 0) {
    return false;
  }

  const firstFixtureDate = predictionWeekFixtures[0]?.kickoff_time;
  const submissionDeadlineTimestamp =
    new Date(firstFixtureDate).getTime() - SUBMISSION_DEADLINE_OFFSET_MS;

  return currentDate > submissionDeadlineTimestamp;
};
