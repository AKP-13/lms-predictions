export const POSITION_OPTIONS = ['All', 'GK', 'DEF', 'MID', 'FWD'] as const;

export type FplPosition = Exclude<(typeof POSITION_OPTIONS)[number], 'All'>;

export type FplPlayerMetrics = {
  playerName: string;
  position: FplPosition;
  fplPrice: number;
  minutesPlayed: number;
  appearances: number;
  goals: number;
  assists: number;
  xg: number;
  xa: number;
  defcon: number;
  xga: number;
  yellowCards: number;
  redCards: number;
};

export type CsvCanonicalHeader =
  | 'player_name'
  | 'position'
  | 'fpl_price'
  | 'minutes_played'
  | 'appearances'
  | 'goals'
  | 'assists'
  | 'xg'
  | 'xa'
  | 'defcon'
  | 'xga'
  | 'yellow_cards'
  | 'red_cards';

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
