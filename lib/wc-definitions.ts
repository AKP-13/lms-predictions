export type WcFixture = {
  id: number;
  round_number: number;
  group_name: string;
  home_team_id: number;
  home_team_name: string;
  home_team_short: string;
  home_team_flag: string | null;
  away_team_id: number;
  away_team_name: string;
  away_team_short: string;
  away_team_flag: string | null;
  kickoff_time: string;
  venue: string | null;
  home_team_score: number | null;
  away_team_score: number | null;
  is_complete: boolean;
};

export type WcTeam = {
  id: number;
  name: string;
  short_name: string;
  group_name: string;
  flag_emoji: string | null;
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
