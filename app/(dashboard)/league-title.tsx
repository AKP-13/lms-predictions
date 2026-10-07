import type { LeagueHeading } from '@/lib/definitions';

export function LeagueTitle({ heading }: { heading: LeagueHeading | null }) {
  return (
    <div className="min-w-0">
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
