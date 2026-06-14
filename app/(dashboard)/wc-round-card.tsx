'use client';

import { WcFixture, WcPick, PickDraft } from '@/lib/wc-definitions';
import {
  WC_ROUND_LABELS,
  WC_ROUND_DEADLINES,
  WC_TEAM_FLAGS
} from '@/lib/wc-constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface WcRoundCardProps {
  roundNumber: number;
  fixtures: WcFixture[];
  currentDraft: PickDraft | null;
  existingPick: WcPick | null;
  usedTeamIds: Set<number>;
  onPickTeam: (fixtureId: number, teamId: number) => void;
  isEliminated: boolean;
}

function formatDate(date: Date, opts: Intl.DateTimeFormatOptions): string {
  return date.toLocaleString('en-GB', { timeZone: 'Europe/London', ...opts });
}

function formatKickoff(isoString: string): string {
  const d = new Date(isoString);
  const day = formatDate(d, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const time = formatDate(d, { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}

function formatDeadline(date: Date): string {
  return formatDate(date, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function RoundStatusBadge({
  isLocked,
  existingPick,
  currentDraft
}: {
  isLocked: boolean;
  existingPick: WcPick | null;
  currentDraft: PickDraft | null;
}) {
  const isSettled = existingPick != null && existingPick.is_correct != null;

  if (isSettled && existingPick?.is_correct === true) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        ✓ Survived
      </Badge>
    );
  }
  if (isSettled && existingPick?.is_correct === false) {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
        ✗ Eliminated
      </Badge>
    );
  }
  if (isLocked && existingPick) {
    return <Badge variant="secondary">Awaiting result</Badge>;
  }
  if (isLocked) {
    return <Badge variant="secondary">No prediction made</Badge>;
  }
  if (
    currentDraft &&
    existingPick &&
    currentDraft.picked_team_id !== existingPick.picked_team_id
  ) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
        Prediction changed
      </Badge>
    );
  }
  if (currentDraft && !existingPick) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
        Prediction unsaved
      </Badge>
    );
  }
  // User had a saved pick but cleared their draft — needs to re-select
  if (!currentDraft && existingPick) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
        Pick a team to continue
      </Badge>
    );
  }
  if (existingPick) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        Prediction saved
      </Badge>
    );
  }
  return <Badge variant="outline">No prediction yet</Badge>;
}

export default function WcRoundCard({
  roundNumber,
  fixtures,
  currentDraft,
  existingPick,
  usedTeamIds,
  onPickTeam,
  isEliminated
}: WcRoundCardProps) {
  const deadline = WC_ROUND_DEADLINES[roundNumber];
  const isLocked = new Date() > deadline;
  const isInteractive = !isLocked && !isEliminated;

  // True when the draft differs from what's saved (or one exists without the other)
  const hasUnsavedChange =
    !isLocked && (
      (currentDraft && !existingPick) ||
      (!currentDraft && !!existingPick) ||
      (currentDraft && existingPick && currentDraft.picked_team_id !== existingPick.picked_team_id)
    );

  // Group fixtures by group_name, sorted alphabetically
  const byGroup = fixtures.reduce<Record<string, WcFixture[]>>((acc, f) => {
    if (!acc[f.group_name]) acc[f.group_name] = [];
    acc[f.group_name].push(f);
    return acc;
  }, {});
  const sortedGroups = Object.keys(byGroup).sort();

  return (
    <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-base font-semibold leading-tight">
            {WC_ROUND_LABELS[roundNumber]}
          </CardTitle>
          <RoundStatusBadge
            isLocked={isLocked}
            existingPick={existingPick}
            currentDraft={currentDraft}
          />
        </div>
        <p className={cn(
          'text-xs mt-1',
          isLocked
            ? 'text-muted-foreground'
            : hasUnsavedChange
              ? 'text-red-500'
              : 'text-muted-foreground'
        )}>
          {isLocked
            ? 'Deadline to make changes has passed'
            : `Make changes by: ${formatDeadline(deadline)}`}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-4">
          {sortedGroups.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Group {group}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {byGroup[group].map((fixture) => (
                  <FixtureRow
                    key={fixture.id}
                    fixture={fixture}
                    currentDraft={currentDraft}
                    usedTeamIds={usedTeamIds}
                    clearedPickTeamId={!currentDraft && existingPick ? existingPick.picked_team_id : null}
                    onPickTeam={onPickTeam}
                    isInteractive={isInteractive}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FixtureRow({
  fixture,
  currentDraft,
  usedTeamIds,
  clearedPickTeamId,
  onPickTeam,
  isInteractive
}: {
  fixture: WcFixture;
  currentDraft: PickDraft | null;
  usedTeamIds: Set<number>;
  clearedPickTeamId: number | null;
  onPickTeam: (fixtureId: number, teamId: number) => void;
  isInteractive: boolean;
}) {
  const homeSelected = currentDraft?.picked_team_id === fixture.home_team_id;
  const awaySelected = currentDraft?.picked_team_id === fixture.away_team_id;
  // Exclude the cleared pick team from "used elsewhere" within this round's card
  // so the user can re-select it without it appearing greyed out.
  const homeUsedElsewhere =
    usedTeamIds.has(fixture.home_team_id) && !homeSelected &&
    fixture.home_team_id !== clearedPickTeamId;
  const awayUsedElsewhere =
    usedTeamIds.has(fixture.away_team_id) && !awaySelected &&
    fixture.away_team_id !== clearedPickTeamId;

  return (
    <div className="flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-2">
      {/* Date/score header — desktop only (sits above the team buttons) */}
      <p className="hidden sm:block text-xs text-muted-foreground text-center mb-1.5">
        {fixture.is_complete
          ? `${fixture.home_team_score}–${fixture.away_team_score}`
          : formatKickoff(fixture.kickoff_time)}
      </p>

      <div className="flex items-center gap-2">
        <TeamButton
          teamId={fixture.home_team_id}
          teamName={fixture.home_team_name}
          isHome={true}
          isSelected={homeSelected}
          isUsedElsewhere={homeUsedElsewhere}
          isInteractive={isInteractive}
          onClick={() => onPickTeam(fixture.id, fixture.home_team_id)}
        />

        {/* Centre column — score/date inline for mobile, just "vs" on desktop */}
        <div className="flex flex-col items-center min-w-[3rem] text-center shrink-0">
          <span className="text-xs text-muted-foreground">
            {fixture.is_complete ? (
              <span className="sm:hidden font-semibold text-gray-700">
                {fixture.home_team_score}–{fixture.away_team_score}
              </span>
            ) : (
              'vs'
            )}
          </span>
          {!fixture.is_complete && (
            <span className="text-[10px] text-muted-foreground leading-tight sm:hidden">
              {formatKickoff(fixture.kickoff_time)}
            </span>
          )}
        </div>

        <TeamButton
          teamId={fixture.away_team_id}
          teamName={fixture.away_team_name}
          isHome={false}
          isSelected={awaySelected}
          isUsedElsewhere={awayUsedElsewhere}
          isInteractive={isInteractive}
          onClick={() => onPickTeam(fixture.id, fixture.away_team_id)}
        />
      </div>

      <WinProbabilityBar fixture={fixture} />
    </div>
  );
}

function WinProbabilityBar({ fixture }: { fixture: WcFixture }) {
  const home = fixture.home_win_probability;
  const away = fixture.away_win_probability;
  // Missing or partial data → render nothing; card identical to before
  if (home == null || away == null) return null;

  const draw = Math.max(0, Math.round((100 - home - away) * 10) / 10);

  return (
    <div className="mt-1.5">
      <div
        role="img"
        aria-label={`Win probability: ${fixture.home_team_name} ${home}%, draw ${draw}%, ${fixture.away_team_name} ${away}%`}
        className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full"
      >
        <div className="basis-0 rounded-full bg-blue-500" style={{ flexGrow: home }} />
        <div className="basis-0 rounded-full bg-gray-300" style={{ flexGrow: draw }} />
        <div className="basis-0 rounded-full bg-rose-400" style={{ flexGrow: away }} />
      </div>
      <div aria-hidden="true" className="mt-0.5 grid grid-cols-3 text-[10px]">
        <span className="text-left font-medium text-blue-600">{home}%</span>
        <span className="text-center text-muted-foreground">Draw {draw}%</span>
        <span className="text-right font-medium text-rose-600">{away}%</span>
      </div>
    </div>
  );
}

function TeamButton({
  teamId,
  teamName,
  isHome,
  isSelected,
  isUsedElsewhere,
  isInteractive,
  onClick
}: {
  teamId: number;
  teamName: string;
  isHome: boolean;
  isSelected: boolean;
  isUsedElsewhere: boolean;
  isInteractive: boolean;
  onClick: () => void;
}) {
  const flag = WC_TEAM_FLAGS[teamName] ?? '🏳';

  const button = (
    <button
      type="button"
      onClick={isUsedElsewhere || !isInteractive ? undefined : onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors flex-1 min-w-0',
        isHome ? 'flex-row-reverse text-right' : 'flex-row text-left',
        isSelected
          ? 'bg-blue-50 border-blue-500 border-2 text-blue-800'
          : isUsedElsewhere
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
            : !isInteractive
              ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-default'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
      )}
    >
      <span className="text-base leading-none shrink-0">{flag}</span>
      <span className="truncate">{teamName}</span>
    </button>
  );

  if (isUsedElsewhere) {
    return (
      <Tooltip>
        <TooltipTrigger asChild className="flex-1 min-w-0">
          {button}
        </TooltipTrigger>
        <TooltipContent>Already used in another round</TooltipContent>
      </Tooltip>
    );
  }

  return <>{button}</>;
}
