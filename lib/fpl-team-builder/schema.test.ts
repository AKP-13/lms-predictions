import { describe, expect, it } from 'vitest';
import { validateCsvRow } from './schema';
import { CsvRawRow } from './types';

const validRow: CsvRawRow = {
  player_name: 'Bukayo Saka',
  position: 'MID',
  fpl_price: '10.1',
  minutes_played: '2950',
  appearances: '34',
  goals: '16',
  assists: '10',
  xg: '14.9',
  xa: '8.2',
  defcon: '24.2',
  xga: '0',
  yellow_cards: '5',
  red_cards: '0'
};

describe('validateCsvRow', () => {
  it('parses a valid row into typed metrics', () => {
    const parsed = validateCsvRow(validRow);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.playerName).toBe('Bukayo Saka');
      expect(parsed.data.position).toBe('MID');
      expect(parsed.data.fplPrice).toBe(10.1);
    }
  });

  it('rejects negative numeric values', () => {
    const parsed = validateCsvRow({
      ...validRow,
      goals: '-1'
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects unknown positions', () => {
    const parsed = validateCsvRow({
      ...validRow,
      position: 'COACH'
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects malformed numeric fields', () => {
    const parsed = validateCsvRow({
      ...validRow,
      fpl_price: 'n/a'
    });
    expect(parsed.success).toBe(false);
  });
});
