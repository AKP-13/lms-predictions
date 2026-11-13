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

// The fixtures can come in any order, so take the earliest kickoff.
export const returnSubmissionDeadline = ({
  predictionWeekFixtures
}: {
  predictionWeekFixtures: FixturesData[];
}): number | null => {
  // A missing kickoff parses as 1970 and an invalid one as NaN, so drop both.
  const kickoffs = predictionWeekFixtures
    .filter(({ kickoff_time }) => kickoff_time)
    .map(({ kickoff_time }) => new Date(kickoff_time).getTime())
    .filter((kickoff) => !Number.isNaN(kickoff));
  if (kickoffs.length === 0) {
    return null;
  }

  return Math.min(...kickoffs) - SUBMISSION_DEADLINE_OFFSET_MS;
};

export const returnIsPastSubmissionDeadline = ({
  predictionWeekFixtures
}: {
  predictionWeekFixtures: FixturesData[];
}) => {
  const deadline = returnSubmissionDeadline({ predictionWeekFixtures });
  return deadline !== null && new Date().getTime() > deadline;
};

export const MINUTE_MS = 60 * 1000;

// "2d 4h", "1h 48m" or "12m". A part minute rounds up, so the last minute is "1m".
export const formatCountdown = (
  deadline: number,
  now: number
): string | null => {
  const msLeft = deadline - now;
  if (!Number.isFinite(msLeft) || msLeft <= 0) return null;

  const totalMinutes = Math.ceil(msLeft / MINUTE_MS);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
