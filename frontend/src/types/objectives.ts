// Interfaces para objetivos
export interface Objective {
  id: string;
  title: string;
  description?: string;
  owner_id?: string;
  company_id: string;
  cycle_id?: string;
  status: 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
  owner_name?: string;
  cycle_name?: string;
  key_results_count: number;
}

export interface CreateObjectiveData {
  title: string;
  description?: string;
  owner_id?: string;
  cycle_id?: string; // Opcional - usa ciclo ativo
}

export interface UpdateObjectiveData {
  title?: string;
  description?: string;
  status?: 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
}

export interface ObjectiveFilters {
  search?: string;
  status?: string[];
  owner_id?: string;
  cycle_id?: string;
  limit?: number;
  offset?: number;
}

export interface ObjectivesResponse {
  objectives: Objective[];
  total: number;
  has_more: boolean;
  filters_applied: ObjectiveFilters;
}

export interface ObjectiveStats {
  total_objectives: number;
  by_status: {
    ON_TRACK: number;
    AT_RISK: number;
    BEHIND: number;
    COMPLETED: number;
    PLANNED: number;
  };
  average_progress: number;
  completed_count: number;
  in_progress_count: number;
  planned_count: number;
}

export interface ObjectiveWithDetails extends Objective {
  // Pode incluir detalhes adicionais no futuro
} 