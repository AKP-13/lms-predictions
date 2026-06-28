'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WcKnockoutFixture } from '@/lib/wc-definitions';
import { WC_TEAMS, WC_ROUND_FIXTURE_LABELS } from '@/lib/wc-constants';

// Dropdown options as "flag name"; map back to the bare name (or null) for the API.
const TBD = 'TBD';
const TEAM_OPTIONS = [TBD, ...WC_TEAMS.map((t) => `${t.flag} ${t.name}`)];
const nameByOption: Record<string, string | null> = {
  [TBD]: null,
  ...Object.fromEntries(WC_TEAMS.map((t) => [`${t.flag} ${t.name}`, t.name]))
};
const optionByName: Record<string, string> = Object.fromEntries(
  WC_TEAMS.map((t) => [t.name, `${t.flag} ${t.name}`])
);

function optionFor(name: string | null): string {
  return name ? (optionByName[name] ?? TBD) : TBD;
}

function formatBST(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
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

type TeamDraft = { home: string; away: string };
type ScoreDraft = { home: string; away: string };
type Feedback = { type: 'success' | 'error'; msg: string };

export default function KnockoutAdminForm({
  fixtures: initialFixtures
}: {
  fixtures: WcKnockoutFixture[];
}) {
  const [fixtures, setFixtures] = useState(initialFixtures);

  const [teamDrafts, setTeamDrafts] = useState<Record<number, TeamDraft>>(() =>
    Object.fromEntries(
      initialFixtures.map((f) => [
        f.id,
        { home: optionFor(f.home_team_name), away: optionFor(f.away_team_name) }
      ])
    )
  );
  const [scoreDrafts, setScoreDrafts] = useState<Record<number, ScoreDraft>>(
    () =>
      Object.fromEntries(
        initialFixtures.map((f) => [
          f.id,
          {
            home: f.home_team_score?.toString() ?? '',
            away: f.away_team_score?.toString() ?? ''
          }
        ])
      )
  );

  const [savingTeams, setSavingTeams] = useState<Set<number>>(new Set());
  const [savingResult, setSavingResult] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});

  function setFb(id: number, fb: Feedback) {
    setFeedback((prev) => ({ ...prev, [id]: fb }));
  }
  function clearFb(id: number) {
    setFeedback((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }
  function toggleSaving(
    set: React.Dispatch<React.SetStateAction<Set<number>>>,
    id: number,
    on: boolean
  ) {
    set((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function patchFixture(id: number, payload: Record<string, unknown>) {
    const res = await fetch('/api/wc/knockout/fixtures', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixture_id: id, ...payload })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save.');
    return data as WcKnockoutFixture;
  }

  async function saveTeams(f: WcKnockoutFixture) {
    const draft = teamDrafts[f.id];
    toggleSaving(setSavingTeams, f.id, true);
    clearFb(f.id);
    try {
      const updated = await patchFixture(f.id, {
        home_team_name: nameByOption[draft.home],
        away_team_name: nameByOption[draft.away]
      });
      setFixtures((prev) => prev.map((x) => (x.id === f.id ? updated : x)));
      setFb(f.id, { type: 'success', msg: 'Teams saved.' });
    } catch (e) {
      setFb(f.id, {
        type: 'error',
        msg: e instanceof Error ? e.message : 'Failed to save.'
      });
    } finally {
      toggleSaving(setSavingTeams, f.id, false);
    }
  }

  async function setPredicted(f: WcKnockoutFixture) {
    toggleSaving(setSavingTeams, f.id, true);
    clearFb(f.id);
    try {
      await patchFixture(f.id, { is_predicted: true });
      // Reflect locally: this one predicted, others in the round cleared.
      setFixtures((prev) =>
        prev.map((x) =>
          x.round_number === f.round_number
            ? { ...x, is_predicted: x.id === f.id }
            : x
        )
      );
      setFb(f.id, { type: 'success', msg: 'Set as the predicted match.' });
    } catch (e) {
      setFb(f.id, {
        type: 'error',
        msg: e instanceof Error ? e.message : 'Failed to save.'
      });
    } finally {
      toggleSaving(setSavingTeams, f.id, false);
    }
  }

  async function saveResult(f: WcKnockoutFixture) {
    const draft = scoreDrafts[f.id];
    if (!isValidScore(draft.home) || !isValidScore(draft.away)) {
      setFb(f.id, { type: 'error', msg: 'Enter both scores (0–99).' });
      return;
    }
    toggleSaving(setSavingResult, f.id, true);
    clearFb(f.id);
    try {
      const res = await fetch('/api/wc/knockout/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture_id: f.id,
          home_team_score: Number(draft.home),
          away_team_score: Number(draft.away)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save result.');
      setFixtures((prev) =>
        prev.map((x) =>
          x.id === f.id
            ? {
                ...x,
                home_team_score: Number(draft.home),
                away_team_score: Number(draft.away),
                is_complete: true
              }
            : x
        )
      );
      setFb(f.id, {
        type: 'success',
        msg: `Result saved · ${data.picks_scored} prediction${data.picks_scored === 1 ? '' : 's'} scored.`
      });
    } catch (e) {
      setFb(f.id, {
        type: 'error',
        msg: e instanceof Error ? e.message : 'Failed to save result.'
      });
    } finally {
      toggleSaving(setSavingResult, f.id, false);
    }
  }

  const rounds = [...new Set(fixtures.map((f) => f.round_number))].sort(
    (a, b) => a - b
  );

  return (
    <main className="my-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Knockout admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set the teams as the bracket resolves, and enter results to score
          predictions. Each round&apos;s predicted match is what players
          predict.
        </p>
      </div>

      {rounds.map((round) => (
        <section key={round} className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            {WC_ROUND_FIXTURE_LABELS[round]}
          </h2>

          {fixtures
            .filter((f) => f.round_number === round)
            .map((f) => {
              const team = teamDrafts[f.id];
              const score = scoreDrafts[f.id];
              const fb = feedback[f.id];
              return (
                <Card key={f.id} className="rounded-xl bg-white shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {f.match_label}
                      </span>
                      {f.is_predicted ? (
                        <span className="text-xs font-semibold text-green-600 whitespace-nowrap">
                          ★ Predicted
                        </span>
                      ) : (
                        <button
                          onClick={() => setPredicted(f)}
                          disabled={savingTeams.has(f.id)}
                          className="text-xs text-amber-700 underline whitespace-nowrap disabled:opacity-50"
                        >
                          Set predicted
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Kicks off {formatBST(f.kickoff_time)}
                    </div>

                    {/* Teams */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <span className="w-12 text-gray-500">Home</span>
                        <Select
                          className="flex-1"
                          options={TEAM_OPTIONS}
                          value={team.home}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTeamDrafts((prev) => ({
                              ...prev,
                              [f.id]: { ...prev[f.id], home: v }
                            }));
                            clearFb(f.id);
                          }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <span className="w-12 text-gray-500">Away</span>
                        <Select
                          className="flex-1"
                          options={TEAM_OPTIONS}
                          value={team.away}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTeamDrafts((prev) => ({
                              ...prev,
                              [f.id]: { ...prev[f.id], away: v }
                            }));
                            clearFb(f.id);
                          }}
                        />
                      </label>
                      <Button
                        variant="outline"
                        onClick={() => saveTeams(f)}
                        disabled={savingTeams.has(f.id)}
                        className="self-start"
                      >
                        {savingTeams.has(f.id) ? 'Saving…' : 'Save teams'}
                      </Button>
                    </div>

                    {/* Result */}
                    <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                      <span className="text-sm text-gray-500">Result</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        aria-label="Home score"
                        value={score.home}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d]/g, '');
                          setScoreDrafts((prev) => ({
                            ...prev,
                            [f.id]: { ...prev[f.id], home: v }
                          }));
                          clearFb(f.id);
                        }}
                        className="h-10 w-12 text-center text-base"
                      />
                      <span className="text-gray-400">–</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        aria-label="Away score"
                        value={score.away}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d]/g, '');
                          setScoreDrafts((prev) => ({
                            ...prev,
                            [f.id]: { ...prev[f.id], away: v }
                          }));
                          clearFb(f.id);
                        }}
                        className="h-10 w-12 text-center text-base"
                      />
                      <Button
                        onClick={() => saveResult(f)}
                        disabled={savingResult.has(f.id)}
                      >
                        {savingResult.has(f.id)
                          ? 'Saving…'
                          : f.is_complete
                            ? 'Update'
                            : 'Save'}
                      </Button>
                    </div>

                    {fb && (
                      <p
                        className={`text-xs ${
                          fb.type === 'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {fb.msg}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </section>
      ))}
    </main>
  );
}
