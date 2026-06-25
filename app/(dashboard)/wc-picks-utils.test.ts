import { describe, it, expect } from 'vitest';
import {
  buildSubmittablePicks,
  computeHasUnsavedDrafts
} from './wc-picks-utils';
import { PickDraft, WcPick } from '@/lib/wc-definitions';

const PAST = new Date('2020-01-01T00:00:00Z');
const FUTURE = new Date('2099-01-01T00:00:00Z');

// Deadlines where rounds 1–5 are locked and round 6 is open
const MIXED_DEADLINES: Record<number, Date> = {
  1: PAST,
  2: PAST,
  3: PAST,
  4: PAST,
  5: PAST,
  6: FUTURE
};

const ALL_OPEN_DEADLINES: Record<number, Date> = {
  1: FUTURE,
  2: FUTURE,
  3: FUTURE,
  4: FUTURE,
  5: FUTURE,
  6: FUTURE
};

function makeDraft(fixtureId: number, teamId: number): PickDraft {
  return { fixture_id: fixtureId, picked_team_id: teamId };
}

function makePick(round: number, fixtureId: number, teamId: number): WcPick {
  return {
    round_number: round,
    fixture_id: fixtureId,
    picked_team_id: teamId,
    is_correct: null,
    submitted_at: '2026-06-01T00:00:00Z',
    last_amended_at: null
  };
}

// ── buildSubmittablePicks ─────────────────────────────────────────────────────

describe('buildSubmittablePicks', () => {
  it('excludes picks for rounds past their deadline', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: makeDraft(101, 1), // locked
      2: null,
      3: null,
      4: null,
      5: null,
      6: makeDraft(106, 6) // open
    };

    const result = buildSubmittablePicks(drafts, MIXED_DEADLINES);

    expect(result).toHaveLength(1);
    expect(result[0].round_number).toBe(6);
    expect(result[0].picked_team_id).toBe(6);
  });

  it('includes all rounds when all deadlines are in the future', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: makeDraft(101, 1),
      2: makeDraft(102, 2),
      3: null,
      4: null,
      5: null,
      6: makeDraft(106, 6)
    };

    const result = buildSubmittablePicks(drafts, ALL_OPEN_DEADLINES);

    expect(result).toHaveLength(3);
    expect(result.map((p) => p.round_number).sort()).toEqual([1, 2, 6]);
  });

  it('returns empty array when all rounds are locked', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: makeDraft(101, 1),
      2: makeDraft(102, 2),
      3: null,
      4: null,
      5: null,
      6: null
    };
    const allLocked: Record<number, Date> = Object.fromEntries(
      [1, 2, 3, 4, 5, 6].map((r) => [r, PAST])
    );

    expect(buildSubmittablePicks(drafts, allLocked)).toHaveLength(0);
  });

  it('returns empty array when all drafts are null', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null
    };

    expect(buildSubmittablePicks(drafts, ALL_OPEN_DEADLINES)).toHaveLength(0);
  });
});

// ── computeHasUnsavedDrafts ───────────────────────────────────────────────────

describe('computeHasUnsavedDrafts', () => {
  it('returns false when only locked rounds have unsaved drafts', () => {
    // Round 1 draft differs from saved pick, but deadline has passed
    const drafts: Record<number, PickDraft | null> = {
      1: makeDraft(101, 99), // different team from saved pick
      2: null,
      3: null,
      4: null,
      5: null,
      6: null
    };
    const saved = [makePick(1, 101, 1)];

    expect(computeHasUnsavedDrafts(drafts, saved, MIXED_DEADLINES)).toBe(false);
  });

  it('returns true when an open round has a draft not yet saved', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: makeDraft(101, 99), // locked, differing draft — should be ignored
      2: null,
      3: null,
      4: null,
      5: null,
      6: makeDraft(106, 6) // open, no saved pick yet
    };
    const saved = [makePick(1, 101, 1)];

    expect(computeHasUnsavedDrafts(drafts, saved, MIXED_DEADLINES)).toBe(true);
  });

  it('returns true when an open round draft differs from the saved pick', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: makeDraft(106, 99) // changed from saved team 6
    };
    const saved = [makePick(6, 106, 6)];

    expect(computeHasUnsavedDrafts(drafts, saved, MIXED_DEADLINES)).toBe(true);
  });

  it('returns false when all open round drafts match their saved picks', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: makeDraft(106, 6)
    };
    const saved = [makePick(6, 106, 6)];

    expect(computeHasUnsavedDrafts(drafts, saved, MIXED_DEADLINES)).toBe(false);
  });

  it('returns false when there are no drafts at all', () => {
    const drafts: Record<number, PickDraft | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null
    };

    expect(computeHasUnsavedDrafts(drafts, [], ALL_OPEN_DEADLINES)).toBe(false);
  });
});
