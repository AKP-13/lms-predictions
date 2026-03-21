import { z } from 'zod';
import { CsvCanonicalHeader, CsvRawRow, FplPlayerMetrics } from './types';

export const REQUIRED_CSV_HEADERS: CsvCanonicalHeader[] = [
  'player_name',
  'position',
  'fpl_price',
  'minutes_played',
  'appearances',
  'goals',
  'assists',
  'xg',
  'xa',
  'defcon',
  'xga',
  'yellow_cards',
  'red_cards'
];

export const CSV_HEADER_ALIASES: Record<string, CsvCanonicalHeader> = {
  player_name: 'player_name',
  playername: 'player_name',
  name: 'player_name',
  position: 'position',
  pos: 'position',
  fpl_price: 'fpl_price',
  price: 'fpl_price',
  minutes_played: 'minutes_played',
  minutes: 'minutes_played',
  appearances: 'appearances',
  apps: 'appearances',
  goals: 'goals',
  assists: 'assists',
  xg: 'xg',
  xa: 'xa',
  defcon: 'defcon',
  defensive_contributions: 'defcon',
  xga: 'xga',
  expected_goals_against: 'xga',
  yellow_cards: 'yellow_cards',
  yc: 'yellow_cards',
  red_cards: 'red_cards',
  rc: 'red_cards'
};

const nonNegativeNumber = z
  .number({
    invalid_type_error: 'must be a number'
  })
  .finite('must be a finite number')
  .min(0, 'must be greater than or equal to 0');

const integerNonNegativeNumber = nonNegativeNumber.refine(Number.isInteger, {
  message: 'must be an integer'
});

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? Number.NaN : Number(trimmed);
  }
  return Number.NaN;
};

const csvRowSchema = z.object({
  player_name: z.string().trim().min(1, 'player_name is required'),
  position: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum(['GK', 'DEF', 'MID', 'FWD'])),
  fpl_price: z.preprocess(parseNumber, nonNegativeNumber),
  minutes_played: z.preprocess(parseNumber, integerNonNegativeNumber),
  appearances: z.preprocess(parseNumber, integerNonNegativeNumber),
  goals: z.preprocess(parseNumber, integerNonNegativeNumber),
  assists: z.preprocess(parseNumber, integerNonNegativeNumber),
  xg: z.preprocess(parseNumber, nonNegativeNumber),
  xa: z.preprocess(parseNumber, nonNegativeNumber),
  defcon: z.preprocess(parseNumber, nonNegativeNumber),
  xga: z.preprocess(parseNumber, nonNegativeNumber),
  yellow_cards: z.preprocess(parseNumber, integerNonNegativeNumber),
  red_cards: z.preprocess(parseNumber, integerNonNegativeNumber)
});

export const normalizeCsvHeader = (header: string): string =>
  header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');

export const getCanonicalHeader = (
  rawHeader: string
): CsvCanonicalHeader | undefined => CSV_HEADER_ALIASES[normalizeCsvHeader(rawHeader)];

export const validateCsvRow = (
  row: CsvRawRow
): { success: true; data: FplPlayerMetrics } | { success: false; message: string } => {
  const parsed = csvRowSchema.safeParse(row);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues.map((issue) => issue.message).join(', ')
    };
  }

  const data = parsed.data;
  return {
    success: true,
    data: {
      playerName: data.player_name,
      position: data.position,
      fplPrice: data.fpl_price,
      minutesPlayed: data.minutes_played,
      appearances: data.appearances,
      goals: data.goals,
      assists: data.assists,
      xg: data.xg,
      xa: data.xa,
      defcon: data.defcon,
      xga: data.xga,
      yellowCards: data.yellow_cards,
      redCards: data.red_cards
    }
  };
};
