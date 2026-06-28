import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  WcKnockoutFixture,
  WcKnockoutPick,
  KnockoutPickInput
} from '@/lib/wc-definitions';
import {
  WC_ROUND_FIXTURE_LABELS,
  WC_TEAM_FLAGS,
  getKnockoutDeadline
} from '@/lib/wc-constants';

// Local editing state — scores are strings so inputs can be empty mid-type.
type Draft = { home: string; away: string };

function flagFor(name: string | null): string {
  return (name && WC_TEAM_FLAGS[name]) || '🏳';
}

function formatBST(date: Date): string {
  return date.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isValidScore(v: string): boolean {
  return /^\d+$/.test(v.trim()) && Number(v) <= 99;
}

function initDrafts(
  fixtures: WcKnockoutFixture[],
  pickByRound: Map<number, WcKnockoutPick>
): Record<number, Draft> {
  const drafts: Record<number, Draft> = {};
  for (const f of fixtures) {
    const pick = pickByRound.get(f.round_number);
    drafts[f.round_number] = {
      home: pick ? String(pick.home_score) : '',
      away: pick ? String(pick.away_score) : ''
    };
  }
  return drafts;
}

function ScoreInput({
  value,
  onChange,
  disabled,
  label
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
      className="h-10 w-12 text-center text-base"
    />
  );
}

export default function KnockoutPicksForm({
  leagueId,
  eligible,
  fixtures,
  isLoadingFixtures,
  picks,
  isLoadingPicks,
  setRefreshTrigger
}: {
  leagueId: number | null;
  eligible: boolean;
  fixtures: WcKnockoutFixture[];
  isLoadingFixtures: boolean;
  picks: WcKnockoutPick[];
  isLoadingPicks: boolean;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const predicted = fixtures
    .filter((f) => f.is_predicted)
    .sort((a, b) => a.round_number - b.round_number);

  const pickByRound = new Map(picks.map((p) => [p.round_number, p]));

  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  // Re-seed drafts from saved picks whenever the league/picks/fixtures change.
  useEffect(() => {
    setDrafts(initDrafts(predicted, pickByRound));
    setFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId, isLoadingPicks, isLoadingFixtures]);

  if (isLoadingFixtures || (isAuthenticated && isLoadingPicks)) {
    return (
      <Card className="rounded-xl bg-white shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Loading…
        </CardContent>
      </Card>
    );
  }

  const now = new Date();

  function setScore(round: number, side: 'home' | 'away', value: string) {
    setDrafts((prev) => ({
      ...prev,
      [round]: { ...(prev[round] ?? { home: '', away: '' }), [side]: value }
    }));
    setFeedback(null);
  }

  async function save() {
    const toSubmit: KnockoutPickInput[] = [];
    for (const f of predicted) {
      const draft = drafts[f.round_number];
      const locked = now > getKnockoutDeadline(f.kickoff_time);
      const scored = pickByRound.get(f.round_number)?.points != null;
      if (!draft || locked || scored) continue;

      const hasHome = draft.home.trim() !== '';
      const hasAway = draft.away.trim() !== '';
      if (!hasHome && !hasAway) continue; // untouched round

      if (!isValidScore(draft.home) || !isValidScore(draft.away)) {
        setFeedback({
          type: 'error',
          msg: `Enter both scores (0–99) for ${WC_ROUND_FIXTURE_LABELS[f.round_number]}.`
        });
        return;
      }
      toSubmit.push({
        round_number: f.round_number,
        fixture_id: f.id,
        home_score: Number(draft.home),
        away_score: Number(draft.away)
      });
    }

    if (toSubmit.length === 0) {
      setFeedback({ type: 'error', msg: 'No open predictions to save.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/wc/knockout/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league_id: leagueId, picks: toSubmit })
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', msg: data.error || 'Failed to save.' });
        return;
      }
      const saved: number = data.savedCount ?? toSubmit.length;
      if (saved === 0) {
        setFeedback({
          type: 'error',
          msg: 'No open predictions were saved.'
        });
        return;
      }
      setFeedback({
        type: 'success',
        msg: `Saved ${saved} prediction${saved === 1 ? '' : 's'} — confirmation emailed.`
      });
      setRefreshTrigger((n) => n + 1);
    } catch {
      setFeedback({ type: 'error', msg: 'Network error — try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const canPlay = isAuthenticated && eligible;
  const hasOpenRound = predicted.some(
    (f) =>
      now <= getKnockoutDeadline(f.kickoff_time) &&
      pickByRound.get(f.round_number)?.points == null
  );

  // Enable Save only when an open round has valid scores that differ from what's
  // already saved (a new or changed prediction).
  const hasSomethingToSave =
    canPlay &&
    predicted.some((f) => {
      if (now > getKnockoutDeadline(f.kickoff_time)) return false;
      const pick = pickByRound.get(f.round_number);
      if (pick?.points != null) return false; // already scored
      const draft = drafts[f.round_number];
      if (!draft || !isValidScore(draft.home) || !isValidScore(draft.away)) {
        return false;
      }
      return (
        !pick ||
        Number(draft.home) !== pick.home_score ||
        Number(draft.away) !== pick.away_score
      );
    });

  return (
    <div className="flex flex-col gap-4">
      {!isAuthenticated && (
        <Card className="rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
          <CardContent className="p-4 text-sm text-amber-800 text-center">
            <a href="/api/auth/signin" className="font-semibold underline">
              Sign in
            </a>{' '}
            to submit your knockout predictions.
          </CardContent>
        </Card>
      )}
      {isAuthenticated && !eligible && (
        <Card className="rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-sm text-gray-600 text-center">
            You&apos;re a spectator in this game — you can follow the scores but
            not submit predictions.
          </CardContent>
        </Card>
      )}

      {canPlay && hasOpenRound && (
        <Button
          onClick={save}
          disabled={submitting || !hasSomethingToSave}
          className="w-full"
        >
          {submitting ? 'Saving…' : 'Save predictions'}
        </Button>
      )}

      {feedback && (
        <p
          className={`text-sm text-center ${
            feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {feedback.msg}
        </p>
      )}

      {predicted.map((f) => {
        const round = f.round_number;
        const pick = pickByRound.get(round);
        const deadline = getKnockoutDeadline(f.kickoff_time);
        const locked = now > deadline;
        const scored = pick?.points != null;
        const editable = canPlay && !locked && !scored;
        const draft = drafts[round] ?? { home: '', away: '' };

        const statusBadge = scored
          ? `${pick!.points} pt${pick!.points === 1 ? '' : 's'}`
          : locked
            ? 'Locked'
            : pick
              ? 'Saved'
              : 'Open';

        return (
          <Card key={f.id} className="rounded-xl bg-white shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {WC_ROUND_FIXTURE_LABELS[round]}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    scored
                      ? 'text-green-600'
                      : locked
                        ? 'text-gray-400'
                        : 'text-amber-600'
                  }`}
                >
                  {statusBadge}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <span className="flex-1 text-right">
                  {f.home_team_name ?? 'TBD'} {flagFor(f.home_team_name)}
                </span>
                {editable ? (
                  <ScoreInput
                    value={draft.home}
                    onChange={(v) => setScore(round, 'home', v)}
                    disabled={submitting}
                    label={`${f.home_team_name ?? 'Home'} score`}
                  />
                ) : (
                  <span className="w-12 text-center text-base font-semibold">
                    {pick ? pick.home_score : '–'}
                  </span>
                )}
                <span className="text-gray-400">–</span>
                {editable ? (
                  <ScoreInput
                    value={draft.away}
                    onChange={(v) => setScore(round, 'away', v)}
                    disabled={submitting}
                    label={`${f.away_team_name ?? 'Away'} score`}
                  />
                ) : (
                  <span className="w-12 text-center text-base font-semibold">
                    {pick ? pick.away_score : '–'}
                  </span>
                )}
                <span className="flex-1 text-left">
                  {flagFor(f.away_team_name)} {f.away_team_name ?? 'TBD'}
                </span>
              </div>

              <div className="text-center text-xs text-gray-500">
                Kicks off {formatBST(new Date(f.kickoff_time))} · deadline{' '}
                {formatBST(deadline)}
              </div>

              {scored && f.is_complete && (
                <div className="text-center text-xs text-gray-600">
                  Result:{' '}
                  <span className="font-semibold">
                    {f.home_team_score}–{f.away_team_score}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

    </div>
  );
}
