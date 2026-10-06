import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resolvePredictionGameweek,
  resolveResultsGameweek,
  returnIsPastSubmissionDeadline,
  returnSubmissionDeadline,
  formatCountdown,
  GameweekEvent
} from './gameweek';
import { MAX_GW } from './constants';
import { FixturesData } from './definitions';

// Helper to create a full season of events, flagging at most one as current
// and at most one as next - the shape FPL's bootstrap actually returns
function createMockSeason({
  currentGw,
  nextGw
}: {
  currentGw?: number;
  nextGw?: number;
}): GameweekEvent[] {
  return Array.from({ length: MAX_GW }, (_, idx) => ({
    id: idx + 1,
    is_current: idx + 1 === currentGw,
    is_next: idx + 1 === nextGw
  }));
}

// Helper to create mock fixture data
function createMockFixture(overrides: Partial<FixturesData>): FixturesData {
  return {
    code: 1,
    event: 1,
    finished: false,
    finished_provisional: false,
    id: 1,
    kickoff_time: '2026-08-21T19:00:00Z',
    minutes: 0,
    provisional_start_time: false,
    started: false,
    team_a: 1,
    team_a_score: 0,
    team_h: 2,
    team_h_score: 0,
    stats: [],
    team_h_difficulty: 3,
    team_a_difficulty: 3,
    pulse_id: 1,
    ...overrides
  };
}

describe('resolvePredictionGameweek', () => {
  it('resolves to gameweek 1 before the season starts', () => {
    // Pre-season: nothing is current yet, gameweek 1 is next
    const events = createMockSeason({ nextGw: 1 });

    expect(resolvePredictionGameweek(events)).toBe(1);
  });

  it('resolves to the next gameweek mid-season', () => {
    const events = createMockSeason({ currentGw: 12, nextGw: 13 });

    expect(resolvePredictionGameweek(events)).toBe(13);
  });

  it('resolves to the final gameweek when it is current and nothing is next', () => {
    const events = createMockSeason({ currentGw: MAX_GW });

    expect(resolvePredictionGameweek(events)).toBe(MAX_GW);
  });

  it('returns null when neither is_current nor is_next is set', () => {
    const events = createMockSeason({});

    expect(resolvePredictionGameweek(events)).toBeNull();
  });

  it('returns null for an empty event list', () => {
    expect(resolvePredictionGameweek([])).toBeNull();
  });

  it('returns null when events are missing', () => {
    expect(resolvePredictionGameweek(null)).toBeNull();
    expect(resolvePredictionGameweek(undefined)).toBeNull();
  });
});

describe('resolveResultsGameweek', () => {
  it('resolves to the current gameweek', () => {
    const events = createMockSeason({ currentGw: 12, nextGw: 13 });

    expect(resolveResultsGameweek(events)).toBe(12);
  });

  it('defaults to gameweek 1 when no gameweek is current', () => {
    // Pre-season, so the Fixtures panel opens on gameweek 1
    const events = createMockSeason({ nextGw: 1 });

    expect(resolveResultsGameweek(events)).toBe(1);
  });

  it('defaults to gameweek 1 when events are missing', () => {
    expect(resolveResultsGameweek(null)).toBe(1);
    expect(resolveResultsGameweek(undefined)).toBe(1);
  });

  it('does not follow the prediction gameweek', () => {
    const events = createMockSeason({ currentGw: 12, nextGw: 13 });

    expect(resolveResultsGameweek(events)).not.toBe(
      resolvePredictionGameweek(events)
    );
  });
});

describe('returnIsPastSubmissionDeadline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false when there are no fixtures', () => {
    expect(returnIsPastSubmissionDeadline({ predictionWeekFixtures: [] })).toBe(
      false
    );
  });

  it('returns false more than two hours before the first kickoff', () => {
    // Kickoff 15:00, deadline 13:00, now 12:00
    const predictionWeekFixtures = [
      createMockFixture({ kickoff_time: '2026-08-21T15:00:00Z' })
    ];

    expect(returnIsPastSubmissionDeadline({ predictionWeekFixtures })).toBe(
      false
    );
  });

  it('returns true within two hours of the first kickoff', () => {
    // Kickoff 13:00, deadline 11:00, now 12:00
    const predictionWeekFixtures = [
      createMockFixture({ kickoff_time: '2026-08-21T13:00:00Z' })
    ];

    expect(returnIsPastSubmissionDeadline({ predictionWeekFixtures })).toBe(
      true
    );
  });

  it('returns false at exactly the deadline', () => {
    // Kickoff 14:00, so the deadline is 12:00 - the same instant as now
    const predictionWeekFixtures = [
      createMockFixture({ kickoff_time: '2026-08-21T14:00:00Z' })
    ];

    expect(returnIsPastSubmissionDeadline({ predictionWeekFixtures })).toBe(
      false
    );
  });

  it('uses the first fixture in the array, not the earliest kickoff', () => {
    // Known limitation: /api/fixtures is passed through unsorted, so a later
    // fixture sitting at index 0 pushes the deadline out
    const predictionWeekFixtures = [
      createMockFixture({ id: 1, kickoff_time: '2026-08-21T18:00:00Z' }),
      createMockFixture({ id: 2, kickoff_time: '2026-08-21T13:00:00Z' })
    ];

    expect(returnIsPastSubmissionDeadline({ predictionWeekFixtures })).toBe(
      false
    );
  });
});

describe('returnSubmissionDeadline', () => {
  it('returns null when there are no fixtures', () => {
    expect(returnSubmissionDeadline({ predictionWeekFixtures: [] })).toBeNull();
  });

  it('returns two hours before the first kickoff', () => {
    const predictionWeekFixtures = [
      createMockFixture({ kickoff_time: '2026-08-21T14:00:00Z' })
    ];

    expect(returnSubmissionDeadline({ predictionWeekFixtures })).toBe(
      new Date('2026-08-21T12:00:00Z').getTime()
    );
  });
});

describe('formatCountdown', () => {
  const deadline = new Date('2026-08-21T12:00:00Z').getTime();
  const before = (ms: number) => deadline - ms;
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it('shows days and hours when a day or more is left', () => {
    expect(
      formatCountdown(deadline, before(2 * DAY + 4 * HOUR + 30 * MINUTE))
    ).toBe('2d 4h');
  });

  it('shows hours and minutes when less than a day is left', () => {
    expect(formatCountdown(deadline, before(HOUR + 48 * MINUTE))).toBe(
      '1h 48m'
    );
  });

  it('shows minutes only when less than an hour is left', () => {
    expect(formatCountdown(deadline, before(12 * MINUTE))).toBe('12m');
  });

  it('rounds a part minute up, so the last minute shows as 1m', () => {
    expect(formatCountdown(deadline, before(30 * 1000))).toBe('1m');
  });

  it('shows 1h 0m when a part minute rounds up to an hour', () => {
    expect(formatCountdown(deadline, before(59 * MINUTE + 30 * 1000))).toBe(
      '1h 0m'
    );
  });

  it('returns null at the deadline', () => {
    expect(formatCountdown(deadline, deadline)).toBeNull();
  });

  it('returns null when the deadline is not a number', () => {
    expect(formatCountdown(NaN, deadline)).toBeNull();
  });

  it('returns null after the deadline', () => {
    expect(formatCountdown(deadline, deadline + MINUTE)).toBeNull();
  });
});
