export type TeamLocation = 'Home' | 'Away';

export type FPLTeamName =
  | 'Arsenal'
  | 'Aston Villa'
  | 'Bournemouth'
  | 'Brentford'
  | 'Brighton'
  | 'Burnely'
  | 'Chelsea'
  | 'Crystal Palace'
  | 'Fulham'
  | 'Leeds'
  | 'Liverpool'
  | 'Man City'
  | 'Man Utd'
  | 'Newcastle'
  | "Nott'm Forest"
  | 'Spurs'
  | 'Sunderland'
  | 'West Ham'
  | 'Wolves';

export type Results = {
  id: number;
  user_id: string;
  game_id: number;
  team_selected: FPLTeamName;
  team_opposing: FPLTeamName;
  team_selected_location: TeamLocation;
  result_selected: 'Win' | 'Draw';
  correct: boolean;
  fpl_gw: number | null;
  round_number: number;
  team_selected_score: number;
  team_opposing_score: number;
};

export type CurrentGameResults = {
  id: number;
  user_id: string;
  team_selected: FPLTeamName;
  team_opposing: FPLTeamName;
  team_selected_location: TeamLocation;
  result_selected: 'Win' | 'Draw';
  correct: boolean;
  fpl_gw: number | null;
  round_number: number;
  team_selected_score: number;
  team_opposing_score: number;
};

export type CurrentGameId = {
  current_game_id: number;
};

export type StatsObj = {
  value: number;
  element: number;
};

export type FixturesData = {
  code: number;
  event: number;
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: string;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number;
  team_h: number;
  team_h_score: number;
  stats: {
    identifier:
      | 'goals_scored'
      | 'assists'
      | 'own_goals'
      | 'penalties_saved'
      | 'penalties_missed'
      | 'yellow_cards'
      | 'red_cards'
      | 'saves'
      | 'bonus'
      | 'bps';
    a: StatsObj[];
    h: StatsObj[];
  }[];
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
};
