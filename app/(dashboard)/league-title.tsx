import type { LeagueHeading } from '@/lib/definitions';
import { cn } from '@/lib/utils';

export function LeagueTitle({
  heading,
  className
}: {
  heading: LeagueHeading | null;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="truncate text-lg font-extrabold leading-[1.375rem]">
        {heading?.leagueName ?? 'Last Player Standing'}
      </div>
      {heading?.week && (
        <div className="truncate text-[0.8125rem] font-semibold leading-[1.125rem] text-muted-foreground">
          Round {heading.week.round} · Gameweek {heading.week.gameweek}
        </div>
      )}
    </div>
  );
}
