import { describe, expect, it } from 'vitest';
import { parseFplPlayerCsv } from './parse-csv';

const validCsv = `player_name,position,fpl_price,minutes_played,appearances,goals,assists,xg,xa,defcon,xga,yellow_cards,red_cards
Bukayo Saka,MID,10.1,2950,34,16,10,14.9,8.2,24.2,0,5,0
William Saliba,DEF,6.2,3200,36,2,1,1.8,0.9,71.3,28.5,6,0`;

describe('parseFplPlayerCsv', () => {
  it('returns players when CSV is valid', () => {
    const parsed = parseFplPlayerCsv(validCsv);
    expect(parsed.players).toHaveLength(2);
    expect(parsed.validationErrors).toHaveLength(0);
    expect(parsed.missingHeaders).toHaveLength(0);
  });

  it('returns missing header errors', () => {
    const csv = `player_name,position
Bukayo Saka,MID`;
    const parsed = parseFplPlayerCsv(csv);
    expect(parsed.players).toHaveLength(0);
    expect(parsed.missingHeaders.length).toBeGreaterThan(0);
  });

  it('supports partial valid rows and captures row-level errors', () => {
    const csv = `player_name,position,fpl_price,minutes_played,appearances,goals,assists,xg,xa,defcon,xga,yellow_cards,red_cards
Bukayo Saka,MID,10.1,2950,34,16,10,14.9,8.2,24.2,0,5,0
Bad Row,DEF,6.2,not-a-number,36,2,1,1.8,0.9,71.3,28.5,6,0`;
    const parsed = parseFplPlayerCsv(csv);
    expect(parsed.players).toHaveLength(1);
    expect(parsed.validationErrors).toHaveLength(1);
    expect(parsed.validationErrors[0].lineNumber).toBe(3);
  });
});
