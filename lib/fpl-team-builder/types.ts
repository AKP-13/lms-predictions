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
  team: number;
  webName: string;
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  defensiveContribution: number;
  starts: number;
  expectedGoals: number;
  expectedAssists: number;
  expectedGoalsConceded: number;
};

export type CsvCanonicalHeader =
  | 'element_type'
  | 'now_cost'
  | 'team'
  | 'web_name'
  | 'minutes'
  | 'goals_scored'
  | 'assists'
  | 'clean_sheets'
  | 'goals_conceded'
  | 'own_goals'
  | 'yellow_cards'
  | 'red_cards'
  | 'defensive_contribution'
  | 'starts'
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
