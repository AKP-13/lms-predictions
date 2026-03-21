import path from 'path';
import { readFile } from 'fs/promises';
import PlayerTable from './player-table';
import { parseFplPlayerCsv } from '@/lib/fpl-team-builder/parse-csv';
import { TableErrorState } from './table-state';

const csvFilePath = path.join(process.cwd(), 'data', 'fplData.csv');

const TeamBuilderPage = async () => {
  let csvContent = '';
  try {
    csvContent = await readFile(csvFilePath, 'utf8');
  } catch {
    return (
      <TableErrorState
        title="Data file not found"
        message="Expected data/fplData.csv. Add the CSV file with the required headers and refresh."
      />
    );
  }

  const parseResult = parseFplPlayerCsv(csvContent);
  if (parseResult.missingHeaders.length > 0) {
    return (
      <TableErrorState
        title="CSV headers are invalid"
        message={`Missing required header(s): ${parseResult.missingHeaders.join(', ')}`}
      />
    );
  }

  if (parseResult.players.length === 0) {
    const firstError =
      parseResult.validationErrors[0]?.message ?? 'No valid player rows found.';
    return <TableErrorState title="No valid rows found" message={firstError} />;
  }

  return (
    <PlayerTable
      players={parseResult.players}
      droppedRows={parseResult.validationErrors.length}
    />
  );
};

export default TeamBuilderPage;
