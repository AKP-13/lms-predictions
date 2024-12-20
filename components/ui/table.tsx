import * as React from 'react';

import { cn } from '@/lib/utils';
import { CurrentGameResults, Results, TeamLocation } from '@/lib/definitions';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

const TeamName = ({
  prediction,
  location
}: {
  prediction: Results | CurrentGameResults;
  location: TeamLocation;
}) => {
  const isHomeTeamPredicted = prediction.team_selected_location === 'Home';
  const isAwayTeamPredicted = prediction.team_selected_location === 'Away';

  const teamName =
    location === 'Home'
      ? isHomeTeamPredicted
        ? prediction.team_selected
        : prediction.team_opposing
      : isHomeTeamPredicted
        ? prediction.team_opposing
        : prediction.team_selected;

  return (
    <span
      className={`font-${(location === 'Home' && isHomeTeamPredicted) || (location === 'Away' && isAwayTeamPredicted) ? 'semibold' : 'normal'}`}
    >
      {teamName}
    </span>
  );
};

const TeamScore = ({
  prediction,
  location
}: {
  prediction: Results | CurrentGameResults;
  location: TeamLocation;
}) => {
  const isHomeTeamPredicted = prediction.team_selected_location === 'Home';
  const isAwayTeamPredicted = prediction.team_selected_location === 'Away';

  const teamScore =
    location === 'Home'
      ? isHomeTeamPredicted
        ? prediction.team_selected_score
        : prediction.team_opposing_score
      : isHomeTeamPredicted
        ? prediction.team_opposing_score
        : prediction.team_selected_score;

  return <span className="font-thin">{teamScore}</span>;
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TeamName,
  TeamScore
};
