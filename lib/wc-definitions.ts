export type WcFixture = {
  id: number;
  round_number: number;
  group_name: string;
  home_team_id: number;
  home_team_name: string;
  home_team_short: string;
  away_team_id: number;
  away_team_name: string;
  away_team_short: string;
  kickoff_time: string;
  venue: string | null;
  home_team_score: number | null;
  away_team_score: number | null;
  is_complete: boolean;
  home_win_probability: number | null;
  away_win_probability: number | null;
};

export type WcTeam = {
  id: number;
  name: string;
  short_name: string;
  group_name: string;
};

export type WcPick = {
  round_number: number;
  fixture_id: number;
  picked_team_id: number;
  is_correct: boolean | null;
  submitted_at: string;
  last_amended_at: string | null;
};

export type PickDraft = {
  fixture_id: number;
  picked_team_id: number;
};

// A single pick as submitted to POST /api/wc/picks
export type PickInput = {
  round_number: number;
  fixture_id: number;
  picked_team_id: number;
};

// Response from PATCH /api/wc/admin after recording a fixture result
export type WcAdminResultResponse = {
  success: boolean;
  fixture_id: number;
  home_team_score: number;
  away_team_score: number;
  winner_team_id: number | null;
  // Count of all picks on this fixture that were (re-)resolved by this request
  picks_resolved: number;
  was_complete: boolean;
};

// ── Knockout stage (score-prediction phase, rounds 7–11) ─────────────────────

// A knockout fixture. Team names are free-text (nullable = TBD until the bracket
// resolves) and chosen by the admin from WC_TEAMS. Exactly one row per round has
// is_predicted = true — the match everyone score-predicts.
export type WcKnockoutFixture = {
  id: number;
  round_number: number; // 7..11
  match_label: string; // e.g. 'R32 Match 16', 'Quarter-Final 4', 'Final'
  home_team_name: string | null;
  away_team_name: string | null;
  kickoff_time: string; // ISO string
  is_predicted: boolean;
  home_team_score: number | null;
  away_team_score: number | null;
  is_complete: boolean;
};

// A user's score prediction for a round's predicted fixture.
export type WcKnockoutPick = {
  round_number: number;
  fixture_id: number;
  home_score: number;
  away_score: number;
  points: number | null; // null until the result is entered (then 5 / 2 / 0)
  submitted_at: string;
  last_amended_at: string | null;
};

// A single knockout prediction as submitted to POST /api/wc/knockout/picks
export type KnockoutPickInput = {
  round_number: number;
  fixture_id: number;
  home_score: number;
  away_score: number;
};

// Response from PATCH /api/wc/knockout/admin after recording a result
export type WcKnockoutAdminResultResponse = {
  success: boolean;
  fixture_id: number;
  home_team_score: number;
  away_team_score: number;
  // Count of picks on this fixture that were (re-)scored by this request
  picks_scored: number;
  was_complete: boolean;
};

// A league the signed-in user belongs to, for the game selector.
export type WcLeagueMembership = {
  league_id: number;
  name: string;
  knockout_only: boolean;
  // Whether the user may submit knockout picks in this league
  // (survivors only in the original game; everyone in the parallel game).
  eligible: boolean;
};

// A row in the knockout points leaderboard for a league.
export type WcKnockoutStanding = {
  user_id: number;
  user_name: string | null;
  points: number;
};
