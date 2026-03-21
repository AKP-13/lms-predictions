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
  FplPlayerMetrics,
  FplPosition,
  POSITION_OPTIONS
} from '@/lib/fpl-team-builder/types';
import TableToolbar from './table-toolbar';
import { TableEmptyState, TableLoadingState, ValidationWarning } from './table-state';

const PAGE_SIZE = 25;

type SortKey = keyof FplPlayerMetrics;
type SortDirection = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; isNumeric?: boolean }[] = [
  { key: 'playerName', label: 'Player name' },
  { key: 'position', label: 'Position' },
  { key: 'fplPrice', label: 'FPL price', isNumeric: true },
  { key: 'minutesPlayed', label: 'Minutes played', isNumeric: true },
  { key: 'appearances', label: 'Appearances', isNumeric: true },
  { key: 'goals', label: 'Goals', isNumeric: true },
  { key: 'assists', label: 'Assists', isNumeric: true },
  { key: 'xg', label: 'Expected Goals (XG)', isNumeric: true },
  { key: 'xa', label: 'Expected Assists (XA)', isNumeric: true },
  { key: 'defcon', label: 'Defensive Contributions (DEFCON)', isNumeric: true },
  { key: 'xga', label: 'Expected Goals Against (XGA)', isNumeric: true },
  { key: 'yellowCards', label: 'Yellow Cards', isNumeric: true },
  { key: 'redCards', label: 'Red Cards', isNumeric: true }
];

const formatValue = (player: FplPlayerMetrics, key: SortKey): string | number => {
  if (key === 'playerName' || key === 'position') {
    return player[key];
  }

  const value = player[key];
  if (key === 'xg' || key === 'xa' || key === 'xga' || key === 'defcon') {
    return Number(value.toFixed(2));
  }
  if (key === 'fplPrice') {
    return Number(value.toFixed(1));
  }
  return value;
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
  const [positionFilter, setPositionFilter] =
    useState<(typeof POSITION_OPTIONS)[number]>('All');
  const [sortKey, setSortKey] = useState<SortKey>('fplPrice');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const searchMatch = player.playerName
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      const positionMatch =
        positionFilter === 'All' || player.position === (positionFilter as FplPosition);
      return searchMatch && positionMatch;
    });
  }, [players, searchTerm, positionFilter]);

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
    setPositionFilter('All');
    setSortKey('fplPrice');
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
          positionFilter={positionFilter}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          onPositionChange={(value) => {
            setPositionFilter(value);
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
                {paginatedPlayers.map((player) => (
                  <TableRow key={`${player.playerName}-${player.position}`}>
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
