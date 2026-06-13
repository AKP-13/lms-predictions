'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { WcFixture, WcAdminResultResponse } from '@/lib/wc-definitions';
import { WC_ROUND_FIXTURE_LABELS, WC_TEAM_FLAGS } from '@/lib/wc-constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ScoreDraft = { home: string; away: string };
type Feedback = { type: 'success' | 'error'; msg: string };

function londonDateStr(d: Date): string {
  // en-CA gives YYYY-MM-DD, which sorts/compares lexicographically
  return d.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
}

function formatKickoff(isoString: string): string {
  const d = new Date(isoString);
  const day = d.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const time = d.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${day}, ${time}`;
}

function isValidScore(v: string): boolean {
  return /^\d+$/.test(v.trim());
}

export default function AdminResultsForm({
  fixtures: initialFixtures
}: {
  fixtures: WcFixture[];
}) {
  const [fixtures, setFixtures] = useState<WcFixture[]>(initialFixtures);
  const [scores, setScores] = useState<Record<number, ScoreDraft>>(() => {
    const init: Record<number, ScoreDraft> = {};
    for (const f of initialFixtures) {
      if (f.is_complete) {
        init[f.id] = {
          home: String(f.home_team_score ?? ''),
          away: String(f.away_team_score ?? '')
        };
      }
    }
    return init;
  });
  const [submitting, setSubmitting] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});

  // Round numbers present in the data, ascending (knockout rounds appear once seeded)
  const rounds = useMemo(
    () =>
      [...new Set(fixtures.map((f) => f.round_number))].sort((a, b) => a - b),
    [fixtures]
  );

  const [selectedRound, setSelectedRound] = useState<number>(() => {
    const today = londonDateStr(new Date());
    const sorted = [
      ...new Set(initialFixtures.map((f) => f.round_number))
    ].sort((a, b) => a - b);
    // Lowest round with an incomplete fixture kicking off today or earlier
    const live = sorted.find((r) =>
      initialFixtures.some(
        (f) =>
          f.round_number === r &&
          !f.is_complete &&
          londonDateStr(new Date(f.kickoff_time)) <= today
      )
    );
    if (live != null) return live;
    // Else the first round with any incomplete fixture
    const pending = sorted.find((r) =>
      initialFixtures.some((f) => f.round_number === r && !f.is_complete)
    );
    return pending ?? sorted[0] ?? 1;
  });

  const roundFixtures = fixtures.filter(
    (f) => f.round_number === selectedRound
  );

  // Group by group_name, sorted alphabetically
  const byGroup = roundFixtures.reduce<Record<string, WcFixture[]>>(
    (acc, f) => {
      (acc[f.group_name] ??= []).push(f);
      return acc;
    },
    {}
  );
  const sortedGroups = Object.keys(byGroup).sort();

  function setScore(fixtureId: number, side: 'home' | 'away', value: string) {
    // Keep digits only; allow empty while typing
    const cleaned = value.replace(/[^\d]/g, '');
    setScores((prev) => {
      const existing = prev[fixtureId] ?? { home: '', away: '' };
      return { ...prev, [fixtureId]: { ...existing, [side]: cleaned } };
    });
    // Clear stale feedback once the score is edited again
    setFeedback((prev) => {
      if (!prev[fixtureId]) return prev;
      const next = { ...prev };
      delete next[fixtureId];
      return next;
    });
  }

  async function submitFixture(fixture: WcFixture) {
    const draft = scores[fixture.id];
    if (!draft || !isValidScore(draft.home) || !isValidScore(draft.away)) {
      setFeedback((prev) => ({
        ...prev,
        [fixture.id]: { type: 'error', msg: 'Enter both scores (0 or more).' }
      }));
      return;
    }

    const home = Number(draft.home);
    const away = Number(draft.away);
    setSubmitting((prev) => new Set(prev).add(fixture.id));
    try {
      const res = await fetch('/api/wc/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture_id: fixture.id,
          home_team_score: home,
          away_team_score: away
        })
      });
      const data: WcAdminResultResponse | { error?: string } = await res.json();
      if (!res.ok) {
        setFeedback((prev) => ({
          ...prev,
          [fixture.id]: {
            type: 'error',
            msg: ('error' in data && data.error) || 'Failed to save result.'
          }
        }));
        return;
      }

      const result = data as WcAdminResultResponse;
      setFixtures((prev) =>
        prev.map((f) =>
          f.id === fixture.id
            ? {
                ...f,
                home_team_score: home,
                away_team_score: away,
                is_complete: true
              }
            : f
        )
      );
      const verb = result.was_complete ? 'Corrected' : 'Saved';
      const noun = result.was_complete ? 're-resolved' : 'resolved';
      setFeedback((prev) => ({
        ...prev,
        [fixture.id]: {
          type: 'success',
          msg: `${verb} ${home}–${away} · ${result.picks_resolved} pick${
            result.picks_resolved === 1 ? '' : 's'
          } ${noun}`
        }
      }));
    } catch {
      setFeedback((prev) => ({
        ...prev,
        [fixture.id]: { type: 'error', msg: 'Network error — try again.' }
      }));
    } finally {
      setSubmitting((prev) => {
        const next = new Set(prev);
        next.delete(fixture.id);
        return next;
      });
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Back to site
        </Link>
        <h1 className="mt-1 text-lg font-semibold">Admin — results entry</h1>
        <p className="text-xs text-muted-foreground">
          Tap in a score and save. Saved fixtures can be corrected by editing
          and saving again.
        </p>
      </div>

      {/* Round selector — scrollable on narrow screens */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {rounds.map((r) => (
          <Button
            key={r}
            type="button"
            size="sm"
            variant={r === selectedRound ? 'default' : 'outline'}
            className="shrink-0"
            onClick={() => setSelectedRound(r)}
          >
            R{r}
          </Button>
        ))}
      </div>

      <p className="mb-3 text-sm font-medium">
        {WC_ROUND_FIXTURE_LABELS[selectedRound] ?? `Round ${selectedRound}`}
      </p>

      <div className="flex flex-col gap-5">
        {sortedGroups.map((group) => (
          <div key={group}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Group {group}
            </p>
            <div className="flex flex-col gap-2">
              {byGroup[group].map((fixture) => (
                <FixtureRow
                  key={fixture.id}
                  fixture={fixture}
                  draft={scores[fixture.id]}
                  feedback={feedback[fixture.id]}
                  submitting={submitting.has(fixture.id)}
                  onScore={setScore}
                  onSubmit={submitFixture}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
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
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-12 text-center text-base"
    />
  );
}

function FixtureRow({
  fixture,
  draft,
  feedback,
  submitting,
  onScore,
  onSubmit
}: {
  fixture: WcFixture;
  draft: ScoreDraft | undefined;
  feedback: Feedback | undefined;
  submitting: boolean;
  onScore: (fixtureId: number, side: 'home' | 'away', value: string) => void;
  onSubmit: (fixture: WcFixture) => void;
}) {
  const home = draft?.home ?? '';
  const away = draft?.away ?? '';
  const canSubmit = isValidScore(home) && isValidScore(away) && !submitting;
  const homeFlag = WC_TEAM_FLAGS[fixture.home_team_name] ?? '🏳';
  const awayFlag = WC_TEAM_FLAGS[fixture.away_team_name] ?? '🏳';

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {formatKickoff(fixture.kickoff_time)}
        </span>
        {fixture.is_complete && (
          <Badge className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
            Complete
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Home */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right">
          <span className="truncate text-sm font-medium">
            {fixture.home_team_short}
          </span>
          <span className="shrink-0 text-base leading-none">{homeFlag}</span>
        </div>

        <ScoreInput
          value={home}
          disabled={submitting}
          onChange={(v) => onScore(fixture.id, 'home', v)}
          label={`${fixture.home_team_name} score`}
        />
        <span className="text-muted-foreground">–</span>
        <ScoreInput
          value={away}
          disabled={submitting}
          onChange={(v) => onScore(fixture.id, 'away', v)}
          label={`${fixture.away_team_name} score`}
        />

        {/* Away */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0 text-base leading-none">{awayFlag}</span>
          <span className="truncate text-sm font-medium">
            {fixture.away_team_short}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-xs',
            feedback?.type === 'success' && 'text-green-700',
            feedback?.type === 'error' && 'text-red-600',
            !feedback && 'text-transparent'
          )}
        >
          {feedback?.msg ?? '·'}
        </span>
        <Button
          type="button"
          size="sm"
          disabled={!canSubmit}
          onClick={() => onSubmit(fixture)}
          className="shrink-0"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : fixture.is_complete ? (
            'Update'
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </div>
  );
}
