
import { HistoryDataPoint } from '@/hooks/history/use-okr-history';
import { Objective } from '@/types/okr';

export interface SummaryMetricsProps {
  data: HistoryDataPoint[];
  objectives: Objective[];
  overallProgress: number;
}

export interface ComparativeChartProps {
  data: HistoryDataPoint[];
  objectives: Objective[];
}

export interface ObjectivesTableProps {
  data: HistoryDataPoint[];
  objectives: Objective[];
}

export interface HistoryStatsProps {
  data: HistoryDataPoint[];
  objectives: Objective[];
  overallProgress: number;
  isLoading?: boolean;
}

export interface HistoryContentProps {
  historyData: HistoryDataPoint[];
  objectiveHistory?: any[];
  objectives: Objective[];
  isLoading: boolean;
  isUpdating?: boolean;
  hasInitialized: boolean;
  hasObjectives: boolean;
}
