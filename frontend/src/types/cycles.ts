// Interfaces para ciclos
export interface Cycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  company_id: string;
  is_active: boolean;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCycleData {
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdateCycleData {
  name?: string;
  start_date?: string;
  end_date?: string;
} 