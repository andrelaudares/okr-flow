// Interfaces para Metas
export interface Meta {
  id: string;
  title: string;
  description?: string;
  objective_id: string;
  owner_id?: string;
  target_value: number;
  current_value: number;
  start_value: number;
  unit: 'PERCENTAGE' | 'NUMBER' | 'CURRENCY' | 'BINARY';
  confidence_level?: number; // 0.0-1.0
  status: 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
  progress: number; // 0-100 (calculado automaticamente)
  due_date?: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  objective_title: string;
}

// Manter compatibilidade com código existente
export type KeyResult = Meta;

export interface CreateMetaData {
  title: string;
  description?: string;
  target_value: number;
  unit: 'PERCENTAGE' | 'NUMBER' | 'CURRENCY' | 'BINARY';
  start_value?: number;
  current_value?: number;
  confidence_level?: number;
  owner_id?: string;
  due_date?: string;
}

// Manter compatibilidade com código existente
export type CreateKeyResultData = CreateMetaData;

export interface UpdateMetaData {
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  confidence_level?: number;
  owner_id?: string;
  due_date?: string;
  status?: 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
}

// Manter compatibilidade com código existente
export type UpdateKeyResultData = UpdateMetaData;

export interface MetaFilters {
  search?: string;
  status?: string[];
  owner_id?: string;
  unit?: string;
  limit?: number;
  offset?: number;
}

// Manter compatibilidade com código existente
export type KeyResultFilters = MetaFilters;

export interface MetasResponse {
  metas?: Meta[];  // Manter compatibilidade
  key_results?: Meta[];  // Campo usado pela API atual
  total: number;
  has_more: boolean;
  filters_applied: MetaFilters;
}

// Manter compatibilidade com código existente
export type KeyResultsResponse = MetasResponse;

// Interfaces para Check-ins
export interface Checkin {
  id: string;
  key_result_id: string;
  author_id: string;
  checkin_date: string;
  value_at_checkin: number;
  confidence_level_at_checkin?: number;
  notes?: string;
  created_at: string;
  author_name?: string;
}

export interface CreateCheckinData {
  value_at_checkin: number;
  confidence_level_at_checkin?: number;
  notes?: string;
}

export interface UpdateCheckinData {
  value_at_checkin?: number;
  confidence_level_at_checkin?: number;
  notes?: string;
}

export interface CheckinsResponse {
  checkins: Checkin[];
  total: number;
} 