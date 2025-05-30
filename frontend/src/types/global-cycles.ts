// Tipos para sistema de ciclos globais

export type CycleType = 'SEMESTRE' | 'TRIMESTRE' | 'QUADRIMESTRE';

export interface GlobalCycle {
  id: string;
  code: string;
  name: string;
  display_name: string;
  type: CycleType;
  year: number;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  
  // Campos calculados para compatibilidade
  days_total?: number;
  days_elapsed?: number;
  days_remaining?: number;
  progress_percentage?: number;
}

export interface GlobalCycleWithStatus extends GlobalCycle {
  is_future: boolean;
  is_past: boolean;
}

export interface UserCyclePreference {
  id: string;
  user_id: string;
  company_id: string;
  global_cycle_code: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface CyclePreferenceUpdate {
  global_cycle_code: string;
  year?: number;
}

export interface CyclePreferenceCreate {
  global_cycle_code: string;
  year?: number;
}

// Utilitários para trabalhar com ciclos

export const CYCLE_CODES = {
  // Semestres
  S1: 'S1',
  S2: 'S2',
  // Trimestres  
  Q1: 'Q1',
  Q2: 'Q2',
  Q3: 'Q3',
  Q4: 'Q4',
  // Quadrimestres
  T1: 'T1',
  T2: 'T2',
  T3: 'T3',
} as const;

export type CycleCode = keyof typeof CYCLE_CODES;

export const CYCLE_TYPES = {
  SEMESTRE: 'SEMESTRE',
  TRIMESTRE: 'TRIMESTRE',
  QUADRIMESTRE: 'QUADRIMESTRE',
} as const;

export const getCycleTypeLabel = (type: CycleType): string => {
  switch (type) {
    case 'SEMESTRE':
      return 'Semestre';
    case 'TRIMESTRE':
      return 'Trimestre';
    case 'QUADRIMESTRE':
      return 'Quadrimestre';
    default:
      return type;
  }
};

export const getCycleIcon = (code: string): string => {
  if (code.startsWith('S')) return '📅'; // Semestre
  if (code.startsWith('Q')) return '📊'; // Trimestre
  if (code.startsWith('T')) return '🗓️'; // Quadrimestre
  return '⏰';
};

export const formatCyclePeriod = (cycle: GlobalCycle): string => {
  const startDate = new Date(cycle.start_date);
  const endDate = new Date(cycle.end_date);
  
  const startFormat = startDate.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  const endFormat = endDate.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  
  return `${startFormat} - ${endFormat}`;
}; 