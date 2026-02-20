import { describe, it, expect } from 'vitest';
import {
  formatFixtureDate,
  formatKickoffTime,
  groupFixturesByDate,
  getSortedDates,
  FixturesByDate
} from './fixtures';
import { FixturesData } from './definitions';

// Helper to create mock fixture data
function createMockFixture(
  overrides: Partial<FixturesData>
): FixturesData {
  return {
    code: 1,
    event: 1,
    finished: false,
    finished_provisional: false,
    id: 1,
    kickoff_time: '2025-01-18T15:00:00Z',
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

describe('formatFixtureDate', () => {
  it('formats date correctly in en-GB format', () => {
    const result = formatFixtureDate('2025-01-18T15:00:00Z');
    // Format should be like "Sat, 18 Jan" (exact output depends on locale)
    expect(result).toContain('18');
    expect(result).toContain('Jan');
  });

  it('handles different dates', () => {
    const result = formatFixtureDate('2025-12-25T12:00:00Z');
    expect(result).toContain('25');
    expect(result).toContain('Dec');
  });
});

describe('formatKickoffTime', () => {
  it('formats time in 24-hour format', () => {
    const result = formatKickoffTime('2025-01-18T15:00:00Z');
    // Should be in HH:MM format (exact time depends on timezone)
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('formats evening kickoffs correctly', () => {
    const result = formatKickoffTime('2025-01-18T20:00:00Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('groupFixturesByDate', () => {
  it('groups fixtures by date for selected gameweek', () => {
    const fixtures = [
      createMockFixture({ event: 1, kickoff_time: '2025-01-18T15:00:00Z', id: 1 }),
      createMockFixture({ event: 1, kickoff_time: '2025-01-18T17:30:00Z', id: 2 }),
      createMockFixture({ event: 2, kickoff_time: '2025-01-25T15:00:00Z', id: 3 })
    ];

    const result = groupFixturesByDate(fixtures, 1);

    // Should only have fixtures from gameweek 1
    expect(Object.keys(result)).toHaveLength(1);
    // Should have 2 fixtures on that date
    expect(Object.values(result)[0]).toHaveLength(2);
  });

  it('returns empty object when no fixtures match gameweek', () => {
    const fixtures = [
      createMockFixture({ event: 1, kickoff_time: '2025-01-18T15:00:00Z' })
    ];

    const result = groupFixturesByDate(fixtures, 5);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('groups fixtures across multiple dates', () => {
    const fixtures = [
      createMockFixture({ event: 1, kickoff_time: '2025-01-18T15:00:00Z', id: 1 }),
      createMockFixture({ event: 1, kickoff_time: '2025-01-19T14:00:00Z', id: 2 }),
      createMockFixture({ event: 1, kickoff_time: '2025-01-19T16:30:00Z', id: 3 })
    ];

    const result = groupFixturesByDate(fixtures, 1);

    expect(Object.keys(result)).toHaveLength(2);
  });

  it('handles empty fixtures array', () => {
    const result = groupFixturesByDate([], 1);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('getSortedDates', () => {
  it('sorts dates chronologically', () => {
    const fixturesByDate: FixturesByDate = {
      'Sun, 19 Jan': [
        createMockFixture({ kickoff_time: '2025-01-19T15:00:00Z' })
      ],
      'Sat, 18 Jan': [
        createMockFixture({ kickoff_time: '2025-01-18T15:00:00Z' })
      ]
    };

    const result = getSortedDates(fixturesByDate);

    expect(result[0]).toBe('Sat, 18 Jan');
    expect(result[1]).toBe('Sun, 19 Jan');
  });

  it('returns empty array for empty input', () => {
    const result = getSortedDates({});
    expect(result).toHaveLength(0);
  });

  it('handles single date', () => {
    const fixturesByDate: FixturesByDate = {
      'Sat, 18 Jan': [
        createMockFixture({ kickoff_time: '2025-01-18T15:00:00Z' })
      ]
    };

    const result = getSortedDates(fixturesByDate);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('Sat, 18 Jan');
  });
});
