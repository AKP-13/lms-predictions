import { describe, expect, it } from 'vitest';
import { parseFplPlayerCsv } from './parse-csv';

const validCsv = `element_type,now_cost,team,web_name,minutes,goals_scored,assists,clean_sheets,goals_conceded,own_goals,yellow_cards,red_cards,defensive_contribution,starts,expected_goals,expected_assists,expected_goals_conceded
3,10.1,1,Saka,2950,16,10,10,20,0,5,0,24.2,34,14.9,8.2,0
2,6.2,1,Saliba,3200,2,1,15,22,0,6,0,71.3,36,1.8,0.9,28.5`;

describe('parseFplPlayerCsv', () => {
  it('returns players when CSV is valid', () => {
    const parsed = parseFplPlayerCsv(validCsv);
    expect(parsed.players).toHaveLength(2);
    expect(parsed.validationErrors).toHaveLength(0);
    expect(parsed.missingHeaders).toHaveLength(0);
  });

  it('returns missing header errors', () => {
    const csv = `element_type,now_cost
3,10.1`;
    const parsed = parseFplPlayerCsv(csv);
    expect(parsed.players).toHaveLength(0);
    expect(parsed.missingHeaders.length).toBeGreaterThan(0);
  });

  it('supports partial valid rows and captures row-level errors', () => {
    const csv = `element_type,now_cost,team,web_name,minutes,goals_scored,assists,clean_sheets,goals_conceded,own_goals,yellow_cards,red_cards,defensive_contribution,starts,expected_goals,expected_assists,expected_goals_conceded
3,10.1,1,Saka,2950,16,10,10,20,0,5,0,24.2,34,14.9,8.2,0
2,6.2,1,Row,not-a-number,2,1,15,22,0,6,0,71.3,36,1.8,0.9,28.5`;
    const parsed = parseFplPlayerCsv(csv);
    expect(parsed.players).toHaveLength(1);
    expect(parsed.validationErrors).toHaveLength(1);
    expect(parsed.validationErrors[0].lineNumber).toBe(3);
  });
});
