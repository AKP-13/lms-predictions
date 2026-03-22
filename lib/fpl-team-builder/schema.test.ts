import { describe, expect, it } from 'vitest';
import { validateCsvRow } from './schema';
import { CsvRawRow } from './types';

const validRow: CsvRawRow = {
  element_type: '3',
  now_cost: '10.1',
  web_name: 'Saka',
  team_eng: 'Arsenal',
  minutes: '2950',
  mp: '28',
  starts: '34',
  subs: '4',
  unsub: '0',
  goals_scored: '16',
  assists: '10',
  clean_sheets: '10',
  goals_conceded: '20',
  own_goals: '0',
  yellow_cards: '5',
  red_cards: '0',
  defensive_contribution: '24.2',
  expected_goals: '14.9',
  expected_assists: '8.2',
  expected_goals_conceded: '0'
};

describe('validateCsvRow', () => {
  it('parses a valid row into typed metrics', () => {
    const parsed = validateCsvRow(validRow);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.elementType).toBe(3);
      expect(parsed.data.webName).toBe('Saka');
      expect(parsed.data.teamEng).toBe('Arsenal');
      expect(parsed.data.nowCost).toBe(10.1);
      expect(parsed.data.mp).toBe(28);
      expect(parsed.data.subs).toBe(4);
      expect(parsed.data.unsub).toBe(0);
    }
  });

  it('rejects negative numeric values', () => {
    const parsed = validateCsvRow({
      ...validRow,
      goals_scored: '-1'
    });
    expect(parsed.success).toBe(false);
  });

  it('requires web_name', () => {
    const parsed = validateCsvRow({
      ...validRow,
      web_name: ''
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid element_type', () => {
    const parsed = validateCsvRow({
      ...validRow,
      element_type: '5'
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects malformed numeric fields', () => {
    const parsed = validateCsvRow({
      ...validRow,
      now_cost: 'n/a'
    });
    expect(parsed.success).toBe(false);
  });
});
