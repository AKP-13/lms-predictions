'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { POSITION_OPTIONS } from '@/lib/fpl-team-builder/types';

type TableToolbarProps = {
  searchTerm: string;
  positionFilter: (typeof POSITION_OPTIONS)[number];
  onSearchChange: (value: string) => void;
  onPositionChange: (value: (typeof POSITION_OPTIONS)[number]) => void;
  onReset: () => void;
};

const TableToolbar = ({
  searchTerm,
  positionFilter,
  onSearchChange,
  onPositionChange,
  onReset
}: TableToolbarProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div className="md:col-span-2">
        <label htmlFor="player-search" className="text-sm text-muted-foreground">
          Search players
        </label>
        <Input
          id="player-search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="e.g. Salah"
        />
      </div>
      <div>
        <label htmlFor="position-filter" className="text-sm text-muted-foreground">
          Position
        </label>
        <Select
          id="position-filter"
          options={[...POSITION_OPTIONS]}
          value={positionFilter}
          onChange={(event) =>
            onPositionChange(event.target.value as (typeof POSITION_OPTIONS)[number])
          }
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="h-10 rounded-md border px-3 text-sm hover:bg-muted"
      >
        Reset filters
      </button>
    </div>
  );
};

export default TableToolbar;
