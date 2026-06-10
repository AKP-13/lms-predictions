'use client';

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Dispatch,
  SetStateAction
} from 'react';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import WcRoundCard from './wc-round-card';
import { Button } from '@/components/ui/button';
import { WcFixture, WcPick, PickDraft } from '@/lib/wc-definitions';
import { WC_ROUND_DEADLINES, WC_TEAM_FLAGS } from '@/lib/wc-constants';

interface WcPicksFormProps {
  wcPicks: WcPick[];
  isLoadingWcPicks: boolean;
  wcFixtures: WcFixture[];
  isLoadingWcFixtures: boolean;
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

function initDrafts(picks: WcPick[]): Record<number, PickDraft | null> {
  const drafts: Record<number, PickDraft | null> = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null
  };
  for (const pick of picks) {
    drafts[pick.round_number] = {
      fixture_id: pick.fixture_id,
      picked_team_id: pick.picked_team_id
    };
  }
  return drafts;
}

export default function WcPicksForm({
  wcPicks,
  isLoadingWcPicks,
  wcFixtures,
  isLoadingWcFixtures,
  refreshTrigger,
  setRefreshTrigger
}: WcPicksFormProps) {
  const { data: session } = useSession();

  const [drafts, setDrafts] = useState<Record<number, PickDraft | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null
  });
  const [draftsInitialised, setDraftsInitialised] = useState(false);
  const [activeRound, setActiveRound] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialise drafts from server picks once loaded, then overlay localStorage
  useEffect(() => {
    if (isLoadingWcPicks || draftsInitialised || !session) return;

    const base = initDrafts(wcPicks);

    if (session?.user?.id) {
      try {
        const stored = localStorage.getItem(`wc:draft:${session.user.id}`);
        if (stored) {
          const local = JSON.parse(stored) as Record<number, PickDraft | null>;
          for (const [roundStr, localDraft] of Object.entries(local)) {
            const round = Number(roundStr);
            const existing = wcPicks.find((p) => p.round_number === round);
            const isSettled = existing != null && existing.is_correct != null;
            if (!isSettled && localDraft) {
              base[round] = localDraft;
            }
          }
        }
      } catch {
        // ignore localStorage errors
      }
    }

    setDrafts(base);
    setDraftsInitialised(true);

    // Jump to first open round without a saved pick
    const now = new Date();
    const firstMissing =
      [1, 2, 3, 4, 5, 6].find(
        (r) =>
          now < WC_ROUND_DEADLINES[r] &&
          !wcPicks.some((p) => p.round_number === r)
      ) ?? 1;
    setActiveRound(firstMissing);
  }, [isLoadingWcPicks, wcPicks, session, draftsInitialised]);

  // Persist drafts to localStorage whenever they change
  useEffect(() => {
    if (!draftsInitialised || !session?.user?.id) return;
    try {
      localStorage.setItem(
        `wc:draft:${session.user.id}`,
        JSON.stringify(drafts)
      );
    } catch {
      // ignore
    }
  }, [drafts, draftsInitialised, session?.user?.id]);

  const fixturesByRound = useMemo(() => {
    const map: Record<number, WcFixture[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: []
    };
    for (const f of wcFixtures) {
      if (map[f.round_number]) map[f.round_number].push(f);
    }
    return map;
  }, [wcFixtures]);

  // Map from team ID → flag emoji, built from fixture data
  const teamIdToFlag = useMemo(() => {
    const map: Record<number, string> = {};
    for (const f of wcFixtures) {
      if (f.home_team_name)
        map[f.home_team_id] = WC_TEAM_FLAGS[f.home_team_name] ?? '🏳';
      if (f.away_team_name)
        map[f.away_team_id] = WC_TEAM_FLAGS[f.away_team_name] ?? '🏳';
    }
    return map;
  }, [wcFixtures]);

  // Set of all team IDs considered "used" across all rounds.
  // If a draft exists for a round, use it. If the draft has been cleared but
  // a saved pick exists for that round, treat the saved team as still used —
  // otherwise the UI would allow re-selecting it in another round.
  const usedTeamIds = useMemo(() => {
    const ids = new Set<number>();
    for (let r = 1; r <= 6; r++) {
      const draft = drafts[r];
      if (draft) {
        ids.add(draft.picked_team_id);
      } else {
        const existing = wcPicks.find((p) => p.round_number === r);
        if (existing) ids.add(existing.picked_team_id);
      }
    }
    return ids;
  }, [drafts, wcPicks]);

  const isEliminated = wcPicks.some((p) => p.is_correct === false);

  const hasUnsavedDrafts = useMemo(
    () =>
      Object.entries(drafts).some(([roundStr, draft]) => {
        if (!draft) return false;
        const existing = wcPicks.find(
          (p) => p.round_number === Number(roundStr)
        );
        if (!existing) return true;
        return (
          existing.picked_team_id !== draft.picked_team_id ||
          existing.fixture_id !== draft.fixture_id
        );
      }),
    [drafts, wcPicks]
  );

  const statusBanner = useMemo(() => {
    if (isEliminated) return null; // has its own banner

    const now = new Date();

    // A round where the user had a saved pick but has since cleared the draft
    const hasClearedPick = [1, 2, 3, 4, 5, 6].some((r) => {
      const isLocked = now > WC_ROUND_DEADLINES[r];
      return (
        !isLocked && !drafts[r] && wcPicks.some((p) => p.round_number === r)
      );
    });

    if (hasUnsavedDrafts) {
      return {
        message:
          'You have unsaved changes — save your picks before the deadline!',
        className: 'bg-red-50 border-red-200 text-red-700'
      } as const;
    }

    if (hasClearedPick) {
      return {
        message:
          "You've removed a selection — pick a replacement team before saving.",
        className: 'bg-amber-50 border-amber-200 text-amber-800'
      } as const;
    }

    const missingCount = [1, 2, 3, 4, 5, 6].filter((r) => {
      const isLocked = now > WC_ROUND_DEADLINES[r];
      return (
        !isLocked && !drafts[r] && !wcPicks.some((p) => p.round_number === r)
      );
    }).length;

    if (missingCount > 0) {
      return {
        message: `You still have ${missingCount} round${missingCount > 1 ? 's' : ''} without a prediction — pick a team for every round and save before the deadline.`,
        className: 'bg-amber-50 border-amber-200 text-amber-800'
      } as const;
    }

    return {
      message: 'All predictions saved — good luck! 🎉',
      className: 'bg-green-50 border-green-200 text-green-700'
    } as const;
  }, [isEliminated, hasUnsavedDrafts, drafts, wcPicks]);

  const handlePickTeam = useCallback(
    (round: number, fixtureId: number, teamId: number) => {
      const isDeselect = drafts[round]?.picked_team_id === teamId;

      setDrafts((prev) => {
        const current = prev[round];
        if (current?.picked_team_id === teamId) {
          return { ...prev, [round]: null };
        }
        return {
          ...prev,
          [round]: { fixture_id: fixtureId, picked_team_id: teamId }
        };
      });

      setError(null);
    },
    [drafts]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const picks = Object.entries(drafts)
      .filter(([, draft]) => draft !== null)
      .map(([roundStr, draft]) => ({
        round_number: Number(roundStr),
        fixture_id: draft!.fixture_id,
        picked_team_id: draft!.picked_team_id
      }));

    if (picks.length === 0) {
      setError('No picks selected.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/wc/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save picks');
      }

      // Refresh server state (badges, is_correct) but keep drafts as-is — they
      // already match what was just saved, so hasUnsavedDrafts resolves to false
      // once the refetched picks land.
      setRefreshTrigger((t) => t + 1);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingWcFixtures || isLoadingWcPicks) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }

  // ── Guest view ─────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <GuestView
        activeRound={activeRound}
        setActiveRound={setActiveRound}
        fixturesByRound={fixturesByRound}
        usedTeamIds={usedTeamIds}
        isLoadingWcFixtures={isLoadingWcFixtures}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isEliminated && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">
          You have been eliminated. Your remaining picks are shown for reference
          only.
        </div>
      )}

      {statusBanner && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${statusBanner.className}`}
        >
          {statusBanner.message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!isEliminated && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasUnsavedDrafts}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              'Save picks'
            )}
          </Button>
          {process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS && (
            <p className="text-xs text-muted-foreground text-center">
              Issues submitting?{' '}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS}?subject=World%20Cup%202026%20-%20Prediction%20Submission&body=Hi%2C%20please%20find%20my%20predictions%20below%3A%0A%0A`}
                className="underline hover:text-foreground transition-colors"
              >
                Email your predictions instead
              </a>
            </p>
          )}
        </div>
      )}

      {/* Round navigation */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground text-center">
          Round {activeRound} of 6
        </p>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setActiveRound((r) => Math.max(r - 1, 1))}
            disabled={activeRound === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((r) => {
              const existing = wcPicks.find((p) => p.round_number === r);
              const draft = drafts[r];
              const pickedId =
                draft?.picked_team_id ?? existing?.picked_team_id;
              const flag = pickedId ? teamIdToFlag[pickedId] : null;

              const borderColor =
                existing?.is_correct === false
                  ? 'border-red-500'
                  : existing?.is_correct === true
                    ? 'border-green-500'
                    : existing &&
                        draft &&
                        draft.picked_team_id === existing.picked_team_id
                      ? 'border-green-400'
                      : draft || (!draft && existing)
                        ? 'border-amber-400'
                        : 'border-gray-200';

              return (
                <button
                  key={r}
                  onClick={() => setActiveRound(r)}
                  aria-label={`Go to round ${r}`}
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center transition-all',
                    borderColor,
                    flag ? 'bg-white' : 'bg-gray-100',
                    r === activeRound
                      ? 'border-4 scale-110'
                      : 'border-2 opacity-60'
                  )}
                >
                  {flag ? (
                    <span className="text-lg leading-none">{flag}</span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">
                      {r}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setActiveRound((r) => Math.min(r + 1, 6))}
            disabled={activeRound === 6}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active round card */}
      <WcRoundCard
        roundNumber={activeRound}
        fixtures={fixturesByRound[activeRound] ?? []}
        currentDraft={drafts[activeRound] ?? null}
        existingPick={
          wcPicks.find((p) => p.round_number === activeRound) ?? null
        }
        usedTeamIds={usedTeamIds}
        onPickTeam={(fixtureId, teamId) =>
          handlePickTeam(activeRound, fixtureId, teamId)
        }
        isEliminated={isEliminated}
      />
    </div>
  );
}

// ── GuestView ────────────────────────────────────────────────────────────────

function GuestView({
  activeRound,
  setActiveRound,
  fixturesByRound,
  usedTeamIds,
  isLoadingWcFixtures
}: {
  activeRound: number;
  setActiveRound: (r: number) => void;
  fixturesByRound: Record<number, WcFixture[]>;
  usedTeamIds: Set<number>;
  isLoadingWcFixtures: boolean;
}) {
  if (isLoadingWcFixtures) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sign in CTA */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col gap-4">
        <div>
          <p className="font-semibold text-gray-900">Want to play?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sign in with your email — we&apos;ll send you a magic link.
          </p>
        </div>
        <Button asChild>
          <a href="/api/auth/signin">Sign in</a>
        </Button>
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to the{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
            privacy policy
          </a>.
        </p>
      </div>

      {/* Locked round navigation — browse only */}
      <div className="flex flex-col gap-2 opacity-50 pointer-events-none select-none">
        <p className="text-xs text-muted-foreground text-center">
          Round {activeRound} of 6
        </p>
        <div className="flex items-center justify-between gap-3">
          <button
            className="p-2 rounded-lg border border-gray-200 text-gray-400"
            disabled
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((r) => (
              <span
                key={r}
                className={cn(
                  'h-3 w-3 rounded-full bg-gray-300',
                  r === activeRound &&
                    'ring-2 ring-offset-2 ring-gray-300 scale-110'
                )}
              />
            ))}
          </div>
          <button
            className="p-2 rounded-lg border border-gray-200 text-gray-400"
            disabled
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Locked round card */}
      <div className="relative">
        <div className="opacity-40 pointer-events-none select-none">
          <WcRoundCard
            roundNumber={activeRound}
            fixtures={fixturesByRound[activeRound] ?? []}
            currentDraft={null}
            existingPick={null}
            usedTeamIds={usedTeamIds}
            onPickTeam={() => {}}
            isEliminated={true}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <span className="bg-white/90 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm border border-gray-200">
            🔒{' '}
            <a href="/api/auth/signin" className="text-blue-600 underline">
              Sign in
            </a>{' '}
            to make picks
          </span>
        </div>
      </div>

    </div>
  );
}
