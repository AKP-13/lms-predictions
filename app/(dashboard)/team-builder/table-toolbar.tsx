'use client';

import { Input } from '@/components/ui/input';

type TableToolbarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
};

const TableToolbar = ({
  searchTerm,
  onSearchChange,
  onReset
}: TableToolbarProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
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
