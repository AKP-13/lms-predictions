/** FPL element_type from CSV: 1 GK, 2 DEF, 3 MD, 4 STR */
export type ElementTypeId = 1 | 2 | 3 | 4;

export const ELEMENT_TYPE_LABELS: Record<ElementTypeId, string> = {
  1: 'GK',
  2: 'DEF',
  3: 'MD',
  4: 'STR'
};

export type FplPlayerMetrics = {
  elementType: ElementTypeId;
  nowCost: number;
  webName: string;
  /** Club name in English (from CSV `team_eng`). */
  teamEng: string;
  minutes: number;
  mp: number;
  starts: number;
  subs: number;
  unsub: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  defensiveContribution: number;
  expectedGoals: number;
  expectedAssists: number;
  expectedGoalsConceded: number;
};

export type CsvCanonicalHeader =
  | 'element_type'
  | 'now_cost'
  | 'web_name'
  | 'team_eng'
  | 'minutes'
  | 'mp'
  | 'starts'
  | 'subs'
  | 'unsub'
  | 'goals_scored'
  | 'assists'
  | 'clean_sheets'
  | 'goals_conceded'
  | 'own_goals'
  | 'yellow_cards'
  | 'red_cards'
  | 'defensive_contribution'
  | 'expected_goals'
  | 'expected_assists'
  | 'expected_goals_conceded';

export type CsvRawRow = Record<CsvCanonicalHeader, string>;

export type CsvValidationError = {
  lineNumber: number;
  message: string;
};

export type ParseCsvResult = {
  players: FplPlayerMetrics[];
  validationErrors: CsvValidationError[];
  missingHeaders: CsvCanonicalHeader[];
};
