import { FPLTeamName } from '@/lib/definitions';
import { useEffect, useState } from 'react';

type FplData = {
  chips: any;
  element_stats: any;
  element_types: any;
  elements: {
    "can_transact": boolean,
    "can_select": boolean,
    "chance_of_playing_next_round": null | number,
    "chance_of_playing_this_round": null | number,
    "code": number,
    "cost_change_event": number,
    "cost_change_event_fall": number,
    "cost_change_start": number,
    "cost_change_start_fall": number,
    "dreamteam_count": number,
    "element_type": number,
    "ep_next": string,
    "ep_this": string,
    "event_points": number,
    "first_name": string,
    "form": string,
    "id": number,
    "in_dreamteam": boolean,
    "news": string,
    "news_added": null | string,
    "now_cost": number,
    "photo": string,
    "points_per_game": string,
    "removed": boolean,
    "second_name": string,
    "selected_by_percent": string,
    "special": boolean,
    "squad_number": null | number,
    "status": string,
    "team": 1,
    "team_code": number,
    "total_points": number,
    "transfers_in": number,
    "transfers_in_event": number,
    "transfers_out": number,
    "transfers_out_event": number,
    "value_form": string,
    "value_season": string,
    "web_name": string,
    "region": number,
    "team_join_date": string,
    "birth_date": string,
    "has_temporary_code": boolean,
    "opta_code": string,
    "minutes": number,
    "goals_scored": number,
    "assists": number,
    "clean_sheets": number,
    "goals_conceded": number,
    "own_goals": number,
    "penalties_saved": number,
    "penalties_missed": number,
    "yellow_cards": number,
    "red_cards": number,
    "saves": number,
    "bonus": number,
    "bps": number,
    "influence": string,
    "creativity": string,
    "threat": string,
    "ict_index": string,
    "clearances_blocks_interceptions": number,
    "recoveries": number,
    "tackles": number,
    "defensive_contribution": number,
    "starts": number,
    "expected_goals": string,
    "expected_assists": string,
    "expected_goal_involvements": string,
    "expected_goals_conceded": string,
    "corners_and_indirect_freekicks_order": null | number,
    "corners_and_indirect_freekicks_text": string,
    "direct_freekicks_order": null | number,
    "direct_freekicks_text": string,
    "penalties_order": null,
    "penalties_text": string,
    "scout_risks": string[],
    "influence_rank": number,
    "influence_rank_type": number,
    "creativity_rank": number,
    "creativity_rank_type": number,
    "threat_rank": number,
    "threat_rank_type": number,
    "ict_index_rank": number,
    "ict_index_rank_type": number,
    "expected_goals_per_90": number,
    "saves_per_90": number,
    "expected_assists_per_90": number,
    "expected_goal_involvements_per_90": number,
    "expected_goals_conceded_per_90": number,
    "goals_conceded_per_90": number,
    "now_cost_rank": number,
    "now_cost_rank_type": number,
    "form_rank": number,
    "form_rank_type": number, 
    "points_per_game_rank": number,
    "points_per_game_rank_type":  number,
    "selected_rank": number,
    "selected_rank_type": number,
    "starts_per_90": number,
    "clean_sheets_per_90": number,
    "defensive_contribution_per_90": number
}[];
  events: {
    id: number;
    name: string;
    deadline_time: string;
    release_time: null;
    average_entry_score: number;
    finished: boolean;
    data_checked: boolean;
    highest_scoring_entry: number;
    deadline_time_epoch: number;
    deadline_time_game_offset: 0;
    highest_score: number;
    is_previous: boolean;
    is_current: boolean;
    is_next: boolean;
    cup_leagues_created: boolean;
    h2h_ko_matches_created: boolean;
    can_enter: boolean;
    can_manage: boolean;
    released: boolean;
    ranked_count: number;
    overrides: {
      rules: {};
      scoring: {};
      element_types: [];
      pick_multiplier: null;
    };
    chip_plays: [
      {
        chip_name: 'bboost';
        num_played: number;
      },
      {
        chip_name: '3xc';
        num_played: number;
      }
    ];
    most_selected: number;
    most_transferred_in: number;
    top_element: number;
    top_element_info: {
      id: number;
      points: number;
    };
    transfers_made: number;
    most_captained: number;
    most_vice_captained: number;
  }[];
  game_config: any;
  game_settings: any;
  phases: any;
  teams: {
    code: number;
    draw: number;
    form: any;
    id: number;
    loss: number;
    name: FPLTeamName;
    played: number;
    points: number;
    position: number;
    pulse_id: number;
    short_name: string;
    strength: number;
    strength_attack_away: number;
    strength_attack_home: number;
    strength_defence_away: number;
    strength_defence_home: number;
    strength_overall_away: number;
    strength_overall_home: number;
    team_division: null;
    unavailable: boolean;
    win: number;
  }[];
  total_players: any;
};

const useFplData = () => {
  const [fplData, setFplData] = useState<FplData | null>(null);
  const [isLoadingFplData, setIsLoadingFplData] = useState(true);

  useEffect(() => {
    async function fetchFplData() {
      setIsLoadingFplData(true);
      const res = await fetch('/api/fpl');
      if (!res.ok) {
        setIsLoadingFplData(false);
        return;
      }
      const formattedData: FplData = await res.json();
      setFplData(formattedData);
      setIsLoadingFplData(false);
    }

    fetchFplData();
  }, []);

  return { fplData, isLoadingFplData };
};

export default useFplData;
export type { FplData };