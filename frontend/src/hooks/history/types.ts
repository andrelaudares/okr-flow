
export interface HistoryDataPoint {
  date: string;
  value: number;
  objectiveId?: string;
  objectiveTitle?: string;
}

export interface ObjectiveHistoryData {
  objective: import('@/types/okr').Objective;
  progressHistory: HistoryDataPoint[];
}

export type DateRangeFilter = 'all' | 'last7days' | 'last30days' | 'last90days' | 'thisWeek' | 'thisMonth';

export interface TrendData {
  period: string;
  average: number;
  target: number;
  difference: number;
}
