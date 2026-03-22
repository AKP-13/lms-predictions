'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ELEMENT_TYPE_LABELS,
  FplPlayerMetrics
} from '@/lib/fpl-team-builder/types';
import TableToolbar from './table-toolbar';
import { TableEmptyState, TableLoadingState, ValidationWarning } from './table-state';

const PAGE_SIZE = 25;

type SortKey = keyof FplPlayerMetrics;
type SortDirection = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; isNumeric?: boolean }[] = [
  { key: 'elementType', label: 'element_type', isNumeric: true },
  { key: 'nowCost', label: 'now_cost', isNumeric: true },
  { key: 'webName', label: 'web_name' },
  { key: 'teamEng', label: 'team_eng' },
  { key: 'minutes', label: 'minutes', isNumeric: true },
  { key: 'mp', label: 'MP', isNumeric: true },
  { key: 'starts', label: 'starts', isNumeric: true },
  { key: 'subs', label: 'Subs', isNumeric: true },
  { key: 'unsub', label: 'unSub', isNumeric: true },
  { key: 'goalsScored', label: 'goals_scored', isNumeric: true },
  { key: 'assists', label: 'assists', isNumeric: true },
  { key: 'cleanSheets', label: 'clean_sheets', isNumeric: true },
  { key: 'goalsConceded', label: 'goals_conceded', isNumeric: true },
  { key: 'ownGoals', label: 'own_goals', isNumeric: true },
  { key: 'yellowCards', label: 'yellow_cards', isNumeric: true },
  { key: 'redCards', label: 'red_cards', isNumeric: true },
  {
    key: 'defensiveContribution',
    label: 'defensive_contribution',
    isNumeric: true
  },
  { key: 'expectedGoals', label: 'expected_goals', isNumeric: true },
  { key: 'expectedAssists', label: 'expected_assists', isNumeric: true },
  {
    key: 'expectedGoalsConceded',
    label: 'expected_goals_conceded',
    isNumeric: true
  }
];

const formatValue = (player: FplPlayerMetrics, key: SortKey): string | number => {
  if (key === 'elementType') {
    return ELEMENT_TYPE_LABELS[player.elementType];
  }
  if (key === 'teamEng') {
    return player.teamEng || '—';
  }
  if (typeof player[key] === 'string') {
    return player[key];
  }

  const value = player[key];
  if (
    key === 'expectedGoals' ||
    key === 'expectedAssists' ||
    key === 'expectedGoalsConceded' ||
    key === 'defensiveContribution'
  ) {
    return Number(value.toFixed(2));
  }
  if (key === 'nowCost') {
    return Number(value.toFixed(1));
  }
  return value as number;
};

const PlayerTable = ({
  players,
  droppedRows,
  isLoading
}: {
  players: FplPlayerMetrics[];
  droppedRows: number;
  isLoading?: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('nowCost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) =>
      player.webName.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [players, searchTerm]);

  const sortedPlayers = useMemo(() => {
    const next = [...filteredPlayers];
    next.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];

      if (typeof left === 'string' && typeof right === 'string') {
        const compare = left.localeCompare(right);
        return sortDirection === 'asc' ? compare : -compare;
      }

      const compare = (left as number) - (right as number);
      return sortDirection === 'asc' ? compare : -compare;
    });
    return next;
  }, [filteredPlayers, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);

  const paginatedPlayers = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE;
    return sortedPlayers.slice(start, start + PAGE_SIZE);
  }, [currentPageSafe, sortedPlayers]);

  const onSort = (key: SortKey) => {
    setCurrentPage(1);
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const onReset = () => {
    setSearchTerm('');
    setSortKey('nowCost');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  return (
    <Card className="rounded-xl bg-white p-2 shadow-sm">
      <CardHeader className="p-2 md:p-6">
        <CardTitle>FPL Team Builder</CardTitle>
        <CardDescription>
          Compare players using season-total stats to inform your picks.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 md:p-6 md:pt-0 space-y-4">
        <ValidationWarning droppedRows={droppedRows} />

        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          onReset={onReset}
        />

        {isLoading ? (
          <TableLoadingState />
        ) : sortedPlayers.length === 0 ? (
          <TableEmptyState onReset={onReset} />
        ) : (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((column) => (
                    <TableHead key={column.key}>
                      <button
                        type="button"
                        onClick={() => onSort(column.key)}
                        className="hover:underline underline-offset-4 text-left"
                      >
                        {column.label}
                        {sortKey === column.key
                          ? sortDirection === 'asc'
                            ? ' ↑'
                            : ' ↓'
                          : ''}
                      </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPlayers.map((player, rowIndex) => (
                  <TableRow
                    key={`${player.webName}-${player.teamEng}-${player.nowCost}-${player.mp}-${rowIndex}`}
                  >
                    {COLUMNS.map((column) => (
                      <TableCell key={column.key}>
                        {formatValue(player, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPageSafe === 1}
                className="disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {currentPageSafe} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPageSafe === totalPages}
                className="disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerTable;
