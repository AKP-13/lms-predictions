import { PickDraft, PickInput, WcPick } from '@/lib/wc-definitions';

export function buildSubmittablePicks(
  drafts: Record<number, PickDraft | null>,
  deadlines: Record<number, Date>
): PickInput[] {
  const now = new Date();
  return Object.entries(drafts)
    .filter(([roundStr, draft]) => {
      if (!draft) return false;
      // Mirror the server's boundary (route.ts rejects only when now > deadline),
      // and keep this consistent with computeHasUnsavedDrafts below.
      return now <= deadlines[Number(roundStr)];
    })
    .map(([roundStr, draft]) => ({
      round_number: Number(roundStr),
      fixture_id: draft!.fixture_id,
      picked_team_id: draft!.picked_team_id
    }));
}

export function computeHasUnsavedDrafts(
  drafts: Record<number, PickDraft | null>,
  wcPicks: WcPick[],
  deadlines: Record<number, Date>
): boolean {
  const now = new Date();
  return Object.entries(drafts).some(([roundStr, draft]) => {
    if (!draft) return false;
    const round = Number(roundStr);
    if (now > deadlines[round]) return false;
    const existing = wcPicks.find((p) => p.round_number === round);
    if (!existing) return true;
    return (
      existing.picked_team_id !== draft.picked_team_id ||
      existing.fixture_id !== draft.fixture_id
    );
  });
}
