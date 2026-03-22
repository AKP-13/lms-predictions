import { describe, expect, it } from 'vitest';
import { parseFplPlayerCsv } from './parse-csv';

const validCsv = `element_type,now_cost,web_name,team_eng,minutes,mp,starts,subs,unsub,goals_scored,assists,clean_sheets,goals_conceded,own_goals,yellow_cards,red_cards,defensive_contribution,expected_goals,expected_assists,expected_goals_conceded
3,10.1,Saka,Arsenal,2950,28,34,4,0,16,10,10,20,0,5,0,24.2,14.9,8.2,0
2,6.2,Saliba,Arsenal,3200,36,36,0,0,2,1,15,22,0,6,0,71.3,1.8,0.9,28.5`;

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
    const csv = `element_type,now_cost,web_name,team_eng,minutes,mp,starts,subs,unsub,goals_scored,assists,clean_sheets,goals_conceded,own_goals,yellow_cards,red_cards,defensive_contribution,expected_goals,expected_assists,expected_goals_conceded
3,10.1,Saka,Arsenal,2950,28,34,4,0,16,10,10,20,0,5,0,24.2,14.9,8.2,0
2,6.2,Row,,not-a-number,0,0,0,0,2,1,15,22,0,6,0,71.3,1.8,0.9,28.5`;
    const parsed = parseFplPlayerCsv(csv);
    expect(parsed.players).toHaveLength(1);
    expect(parsed.validationErrors).toHaveLength(1);
    expect(parsed.validationErrors[0].lineNumber).toBe(3);
  });
});
