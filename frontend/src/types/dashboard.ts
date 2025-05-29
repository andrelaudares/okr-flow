export enum TrendDirection {
  UP = "UP",
  DOWN = "DOWN", 
  STABLE = "STABLE"
}

export enum StatusColor {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED"
}

export interface DashboardStats {
  total_objectives: number;
  total_key_results: number;
  active_users: number;
  active_cycle_name?: string;
  active_cycle_progress: number;
  company_name: string;
  last_updated: string;
}

export interface ProgressData {
  current_progress: number;
  expected_progress: number;
  variance: number;
  status_color: StatusColor;
  trend_direction: TrendDirection;
  trend_percentage: number;
  cycle_days_total: number;
  cycle_days_elapsed: number;
  cycle_days_remaining: number;
}

export interface ObjectivesCount {
  total: number;
  completed: number;
  on_track: number;
  at_risk: number;
  behind: number;
  planned: number;
  completion_rate: number;
  on_track_rate: number;
}

export interface EvolutionPoint {
  date: string;
  actual_progress: number;
  expected_progress: number;
  objectives_count: number;
}

export interface EvolutionData {
  period_start: string;
  period_end: string;
  current_date: string;
  evolution_points: EvolutionPoint[];
  trend_analysis: {
    direction: string;
    average_weekly_growth: number;
    consistency_score: number;
    prediction_next_week: number;
  };
  performance_summary: {
    overall_score: number;
    time_efficiency: number;
    goal_achievement: number;
    team_engagement: number;
  };
}

// Time Cards (já existentes, mantendo compatibilidade)
export interface TimeCard {
  type: 'TRIMESTRE' | 'QUADRIMESTRE' | 'SEMESTRE' | 'ANO';
  title: string;
  period: string;
  progress_percentage: number;
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  start_date: string;
  end_date: string;
}

export interface TimeCardsResponse {
  time_cards: TimeCard[];
  user_preferences: {
    selected_cards: string[];
  };
  active_cycle?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    progress_percentage: number;
  };
} 