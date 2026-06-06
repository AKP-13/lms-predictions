'use client';

import { useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
import { useSession } from 'next-auth/react';
import { Loader } from 'lucide-react';
import WcRoundCard from './wc-round-card';
import { Button } from '@/components/ui/button';
import { WcFixture, WcPick, PickDraft } from '@/lib/wc-definitions';
import { WC_ROUND_DEADLINES } from '@/lib/wc-constants';

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
            const isSettled =
              existing != null && existing.is_correct != null;
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

  // Set of all team IDs currently selected across all rounds
  const usedTeamIds = useMemo(
    () =>
      new Set(
        Object.values(drafts)
          .filter((d): d is PickDraft => d !== null)
          .map((d) => d.picked_team_id)
      ),
    [drafts]
  );

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
      return !isLocked && !drafts[r] && wcPicks.some((p) => p.round_number === r);
    });

    if (hasUnsavedDrafts || hasClearedPick) {
      return {
        message: 'You have unsaved changes — save your picks before the deadline!',
        className: 'bg-red-50 border-red-200 text-red-700'
      } as const;
    }

    const missingCount = [1, 2, 3, 4, 5, 6].filter((r) => {
      const isLocked = now > WC_ROUND_DEADLINES[r];
      return !isLocked && !drafts[r] && !wcPicks.some((p) => p.round_number === r);
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
      setDrafts((prev) => {
        const current = prev[round];
        // Clicking the already-selected team deselects it
        if (current?.picked_team_id === teamId) {
          return { ...prev, [round]: null };
        }
        return { ...prev, [round]: { fixture_id: fixtureId, picked_team_id: teamId } };
      });
      setError(null);
    },
    []
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
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
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

  if (!session) {
    return (
      <div className="text-center py-12">
        <a
          href="/api/auth/signin"
          className="text-blue-600 font-semibold underline"
        >
          Sign in to submit your picks
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isEliminated && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">
          You have been eliminated. Your remaining picks are shown for reference only.
        </div>
      )}

      {statusBanner && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${statusBanner.className}`}>
          {statusBanner.message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {[1, 2, 3, 4, 5, 6].map((round) => (
        <WcRoundCard
          key={round}
          roundNumber={round}
          fixtures={fixturesByRound[round] ?? []}
          currentDraft={drafts[round] ?? null}
          existingPick={wcPicks.find((p) => p.round_number === round) ?? null}
          usedTeamIds={usedTeamIds}
          onPickTeam={(fixtureId, teamId) =>
            handlePickTeam(round, fixtureId, teamId)
          }
          isEliminated={isEliminated}
        />
      ))}

      {!isEliminated && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !hasUnsavedDrafts}
          className="w-full mt-2"
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
      )}
    </div>
  );
}
