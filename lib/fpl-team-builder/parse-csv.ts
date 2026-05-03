import {
  getCanonicalHeader,
  validateCsvRow,
  REQUIRED_CSV_HEADERS
} from './schema';
import {
  CsvCanonicalHeader,
  CsvRawRow,
  CsvValidationError,
  ParseCsvResult
} from './types';

const splitCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentValue += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  values.push(currentValue.trim());
  return values;
};

const getRawRows = (rows: string[]): string[] =>
  rows.map((row) => row.trim()).filter((row) => row.length > 0);

export const parseFplPlayerCsv = (content: string): ParseCsvResult => {
  const rows = getRawRows(content.split(/\r?\n/));
  if (rows.length === 0) {
    return {
      players: [],
      validationErrors: [
        {
          lineNumber: 1,
          message: 'CSV is empty'
        }
      ],
      missingHeaders: REQUIRED_CSV_HEADERS
    };
  }

  const rawHeaders = splitCsvLine(rows[0]);
  const canonicalHeaders = rawHeaders.map((header) =>
    getCanonicalHeader(header)
  );
  console.log('canonicalHeaders', canonicalHeaders);
  const presentHeaders = canonicalHeaders.filter(
    Boolean
  ) as CsvCanonicalHeader[];
  const missingHeaders = REQUIRED_CSV_HEADERS.filter(
    (requiredHeader) => !presentHeaders.includes(requiredHeader)
  );

  if (missingHeaders.length > 0) {
    return {
      players: [],
      validationErrors: [
        {
          lineNumber: 1,
          message: `Missing required header(s): ${missingHeaders.join(', ')}`
        }
      ],
      missingHeaders
    };
  }

  const players = [];
  const validationErrors: CsvValidationError[] = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const values = splitCsvLine(rows[rowIndex]);
    const row: Partial<CsvRawRow> = {};

    for (
      let columnIndex = 0;
      columnIndex < canonicalHeaders.length;
      columnIndex += 1
    ) {
      const header = canonicalHeaders[columnIndex];
      if (!header) {
        continue;
      }
      row[header] = values[columnIndex] ?? '';
    }

    const validated = validateCsvRow(row as CsvRawRow);
    if (!validated.success) {
      validationErrors.push({
        lineNumber: rowIndex + 1,
        message: validated.message
      });
      continue;
    }

    players.push(validated.data);
  }

  return {
    players,
    validationErrors,
    missingHeaders: []
  };
};
