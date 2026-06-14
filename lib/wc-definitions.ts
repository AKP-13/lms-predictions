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
