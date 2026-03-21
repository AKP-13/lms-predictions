import { z } from 'zod';
import {
  CsvCanonicalHeader,
  CsvRawRow,
  ElementTypeId,
  FplPlayerMetrics
} from './types';

export const REQUIRED_CSV_HEADERS: CsvCanonicalHeader[] = [
  'element_type',
  'now_cost',
  'team',
  'web_name',
  'minutes',
  'goals_scored',
  'assists',
  'clean_sheets',
  'goals_conceded',
  'own_goals',
  'yellow_cards',
  'red_cards',
  'defensive_contribution',
  'starts',
  'expected_goals',
  'expected_assists',
  'expected_goals_conceded'
];

export const CSV_HEADER_ALIASES: Record<string, CsvCanonicalHeader> = {
  element_type: 'element_type',
  elemnt_type: 'element_type',
  now_cost: 'now_cost',
  team: 'team',
  web_name: 'web_name',
  minutes: 'minutes',
  goals_scored: 'goals_scored',
  assists: 'assists',
  clean_sheets: 'clean_sheets',
  goals_conceded: 'goals_conceded',
  own_goals: 'own_goals',
  yellow_cards: 'yellow_cards',
  red_cards: 'red_cards',
  defensive_contribution: 'defensive_contribution',
  starts: 'starts',
  expected_goals: 'expected_goals',
  expected_assists: 'expected_assists',
  expected_goals_conceded: 'expected_goals_conceded'
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

/** CSV element_type: 1 GK, 2 DEF, 3 MD, 4 STR */
const elementTypeSchema = z.preprocess(
  parseNumber,
  z
    .number({
      invalid_type_error: 'element_type must be a number'
    })
    .int('element_type must be an integer')
    .refine((n): n is ElementTypeId => n === 1 || n === 2 || n === 3 || n === 4, {
      message: 'element_type must be 1 (GK), 2 (DEF), 3 (MD), or 4 (STR)'
    })
);

const csvRowSchema = z.object({
  element_type: elementTypeSchema,
  now_cost: z.preprocess(parseNumber, nonNegativeNumber),
  team: z.preprocess(parseNumber, integerNonNegativeNumber),
  web_name: z.string().trim().min(1, 'web_name is required'),
  minutes: z.preprocess(parseNumber, integerNonNegativeNumber),
  goals_scored: z.preprocess(parseNumber, integerNonNegativeNumber),
  assists: z.preprocess(parseNumber, integerNonNegativeNumber),
  clean_sheets: z.preprocess(parseNumber, integerNonNegativeNumber),
  goals_conceded: z.preprocess(parseNumber, integerNonNegativeNumber),
  own_goals: z.preprocess(parseNumber, integerNonNegativeNumber),
  yellow_cards: z.preprocess(parseNumber, integerNonNegativeNumber),
  red_cards: z.preprocess(parseNumber, integerNonNegativeNumber),
  defensive_contribution: z.preprocess(parseNumber, nonNegativeNumber),
  starts: z.preprocess(parseNumber, integerNonNegativeNumber),
  expected_goals: z.preprocess(parseNumber, nonNegativeNumber),
  expected_assists: z.preprocess(parseNumber, nonNegativeNumber),
  expected_goals_conceded: z.preprocess(parseNumber, nonNegativeNumber)
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
      elementType: data.element_type,
      nowCost: data.now_cost,
      team: data.team,
      webName: data.web_name,
      minutes: data.minutes,
      goalsScored: data.goals_scored,
      assists: data.assists,
      cleanSheets: data.clean_sheets,
      goalsConceded: data.goals_conceded,
      ownGoals: data.own_goals,
      yellowCards: data.yellow_cards,
      redCards: data.red_cards,
      defensiveContribution: data.defensive_contribution,
      starts: data.starts,
      expectedGoals: data.expected_goals,
      expectedAssists: data.expected_assists,
      expectedGoalsConceded: data.expected_goals_conceded
    }
  };
};
