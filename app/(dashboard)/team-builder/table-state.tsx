import { AlertTriangle } from 'lucide-react';

export const TableLoadingState = () => {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-10 rounded-md bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
};

export const TableEmptyState = ({ onReset }: { onReset: () => void }) => {
  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <p className="font-medium">No matching players</p>
      <p className="text-sm text-muted-foreground mt-1">
        Adjust your search and filters to see players.
      </p>
      <button
        onClick={onReset}
        className="mt-4 text-sm underline underline-offset-4"
        type="button"
      >
        Clear filters
      </button>
    </div>
  );
};

export const TableErrorState = ({
  title,
  message
}: {
  title: string;
  message: string;
}) => {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        {title}
      </div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
};

export const ValidationWarning = ({ droppedRows }: { droppedRows: number }) => {
  if (droppedRows === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      {droppedRows} row{droppedRows === 1 ? '' : 's'} were skipped due to validation
      issues.
    </div>
  );
};
