export type ActivityStatus = 'Not Started' | 'In Progress' | 'At Risk' | 'Completed' | 'On Hold';

export interface ActivityItem {
  id: string;
  title: string;
  status: ActivityStatus;
  progress: number;
  assignee: string;
  dueDate?: string; // Added due date field
  observation?: string; // Added observation field
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  owner_id?: string;
  company_id: string;
  cycle_id?: string; // Agora é opcional
  status: 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
  owner_name?: string;
  cycle_name?: string; // Agora é opcional
  key_results_count: number;
  activities?: ActivityItem[]; // Compatibilidade com código existente
}
