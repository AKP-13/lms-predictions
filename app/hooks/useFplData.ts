import { FPLTeamName } from '@/lib/definitions';
import { useEffect, useState } from 'react';

type FplData = {
  chips: any;
  element_stats: any;
  element_types: any;
  elements: any;
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
