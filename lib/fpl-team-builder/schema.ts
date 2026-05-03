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
  'web_name',
  'team_eng',
  'minutes',
  'mp',
  'starts',
  'subs',
  'unsub',
  'goals_scored',
  'assists',
  'clean_sheets',
  'goals_conceded',
  'own_goals',
  'yellow_cards',
  'red_cards',
  'defensive_contribution',
  'expected_goals',
  'expected_assists',
  'expected_goals_conceded'
];

export const CSV_HEADER_ALIASES: Record<string, CsvCanonicalHeader> = {
  element_type: 'element_type',
  elemnt_type: 'element_type',
  now_cost: 'now_cost',
  web_name: 'web_name',
  team_eng: 'team_eng',
  minutes: 'minutes',
  mp: 'mp',
  starts: 'starts',
  subs: 'subs',
  unsub: 'unsub',
  un_sub: 'unsub',
  goals_scored: 'goals_scored',
  assists: 'assists',
  clean_sheets: 'clean_sheets',
  goals_conceded: 'goals_conceded',
  own_goals: 'own_goals',
  yellow_cards: 'yellow_cards',
  red_cards: 'red_cards',
  defensive_contribution: 'defensive_contribution',
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

/** FPL CSV/API often stores price as tenths of a million (e.g. 102 → £10.2m). */
const parseNowCost = (value: unknown) => {
  const n = parseNumber(value);
  if (Number.isNaN(n)) {
    return n;
  }
  if (Number.isInteger(n) && n >= 35 && n <= 200) {
    return n / 10;
  }
  return n;
};

/** CSV element_type: 1 GK, 2 DEF, 3 MD, 4 STR */
const elementTypeSchema = z.preprocess(
  parseNumber,
  z
    .number({
      invalid_type_error: 'element_type must be a number'
    })
    .int('element_type must be an integer')
    .refine(
      (n): n is ElementTypeId => n === 1 || n === 2 || n === 3 || n === 4,
      {
        message: 'element_type must be 1 (GK), 2 (DEF), 3 (MD), or 4 (STR)'
      }
    )
);

const csvRowSchema = z.object({
  element_type: elementTypeSchema,
  now_cost: z.preprocess(parseNowCost, nonNegativeNumber),
  web_name: z.string().trim().min(1, 'web_name is required'),
  team_eng: z.string().trim(),
  minutes: z.preprocess(parseNumber, integerNonNegativeNumber),
  mp: z.preprocess(parseNumber, integerNonNegativeNumber),
  starts: z.preprocess(parseNumber, integerNonNegativeNumber),
  subs: z.preprocess(parseNumber, integerNonNegativeNumber),
  unsub: z.preprocess(parseNumber, integerNonNegativeNumber),
  goals_scored: z.preprocess(parseNumber, integerNonNegativeNumber),
  assists: z.preprocess(parseNumber, integerNonNegativeNumber),
  clean_sheets: z.preprocess(parseNumber, integerNonNegativeNumber),
  goals_conceded: z.preprocess(parseNumber, integerNonNegativeNumber),
  own_goals: z.preprocess(parseNumber, integerNonNegativeNumber),
  yellow_cards: z.preprocess(parseNumber, integerNonNegativeNumber),
  red_cards: z.preprocess(parseNumber, integerNonNegativeNumber),
  defensive_contribution: z.preprocess(parseNumber, nonNegativeNumber),
  expected_goals: z.preprocess(parseNumber, nonNegativeNumber),
  expected_assists: z.preprocess(parseNumber, nonNegativeNumber),
  expected_goals_conceded: z.preprocess(parseNumber, nonNegativeNumber)
});

export const normalizeCsvHeader = (header: string): string =>
  header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');

export const getCanonicalHeader = (
  rawHeader: string
): CsvCanonicalHeader | undefined => {
  const normalized = normalizeCsvHeader(rawHeader);
  return CSV_HEADER_ALIASES[normalized];
};

export const validateCsvRow = (
  row: CsvRawRow
):
  | { success: true; data: Omit<FplPlayerMetrics, 'expectedPointsAppearance'> }
  | { success: false; message: string } => {
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
      webName: data.web_name,
      teamEng: data.team_eng,
      minutes: data.minutes,
      mp: data.mp,
      starts: data.starts,
      subs: data.subs,
      unsub: data.unsub,
      goalsScored: data.goals_scored,
      assists: data.assists,
      cleanSheets: data.clean_sheets,
      goalsConceded: data.goals_conceded,
      ownGoals: data.own_goals,
      yellowCards: data.yellow_cards,
      redCards: data.red_cards,
      defensiveContribution: data.defensive_contribution,
      expectedGoals: data.expected_goals,
      expectedAssists: data.expected_assists,
      expectedGoalsConceded: data.expected_goals_conceded
    }
  };
};
