export type TeamLocation = 'Home' | 'Away';

export type Results = {
  id: number;
  user_id: string;
  game_id: number;
  team_selected: string;
  team_opposing: string;
  team_selected_location: TeamLocation;
  result_selected: 'Win' | 'Draw';
  correct: boolean;
  fpl_gw: number | null;
  round_number: number;
  team_selected_score: number;
  team_opposing_score: number;
};
