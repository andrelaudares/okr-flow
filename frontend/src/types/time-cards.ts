import type { Cycle } from './cycles';

// Interfaces para cards temporais
export interface TimeCard {
  type: 'TRIMESTRE' | 'QUADRIMESTRE' | 'SEMESTRE' | 'ANO' | 'CYCLE';
  title: string;
  period: string;
  progress_percentage: number;
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  start_date: string;
  end_date: string;
  category?: 'temporal' | 'cycle';
}

export interface AvailableCard {
  id: string;
  type: string;
  title: string;
  description: string;
  category: 'temporal' | 'cycle';
}

export interface TimeCardsResponse {
  time_cards: TimeCard[];
  user_preferences: {
    selected_cards: string[];
  };
  active_cycle?: Cycle;
  all_cycles?: Cycle[];
}

export interface UpdateTimePreferencesData {
  selected_cards: string[];
} 