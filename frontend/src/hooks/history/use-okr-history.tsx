
import { useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchObjectivesForHistory, fetchHistoryRecords } from './fetch-history-data';
import { generateObjectiveHistory, calculateOverallProgressHistory } from './history-processors';
import { ObjectiveHistoryData, HistoryDataPoint, DateRangeFilter } from './types';
import { useObjectives } from '@/hooks/use-objectives';
import { useDashboardObjectives } from '@/hooks/use-dashboard-objectives';
import { filterByDateRange } from './history-filters';
import { recordObjectiveHistory } from '@/utils/supabase/history';
import { toast } from 'sonner';

export type { HistoryDataPoint, ObjectiveHistoryData };

export const useOkrHistory = () => {
  const [forceRefresh, setForceRefresh] = useState(0);
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all');
  const queryClient = useQueryClient();

  // Get local objectives from Zustand store
  const { objectives: localObjectives } = useObjectives();
  
  // Get information about data source
  const { isUsingRemoteData } = useDashboardObjectives();

  // Fetch all objectives with their activities from Supabase
  const { 
    data: remoteObjectives = [], 
    isLoading: isLoadingObjectives,
  } = useQuery({
    queryKey: ['objectives-history', forceRefresh],
    queryFn: fetchObjectivesForHistory,
  });

  // Fetch historical progress data
  const { 
    data: rawHistoryData = [], 
    isLoading: isLoadingHistory,
  } = useQuery({
    queryKey: ['objectives-progress-history', forceRefresh],
    queryFn: fetchHistoryRecords,
  });

  // Transform raw history data to match HistoryDataPoint type
  const historyData = useMemo(() => {
    return rawHistoryData.map((record: any): HistoryDataPoint => ({
      date: record.recorded_at ? record.recorded_at.split('T')[0] : new Date().toISOString().split('T')[0],
      value: record.progress || 0,
      objectiveId: record.objective_id,
      objectiveTitle: undefined // We'll fill this in later if needed
    }));
  }, [rawHistoryData]);

  // Mutation for updating history
  const { mutate: updateHistory, isPending: isUpdating } = useMutation({
    mutationFn: async ({ objectiveId, progress }: { objectiveId: string, progress: number }) => {
      return await recordObjectiveHistory(objectiveId, progress);
    },
    onSuccess: () => {
      toast.success('Histórico atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['objectives-progress-history'] });
      setForceRefresh(prev => prev + 1);
    },
    onError: (error) => {
      console.error('Erro ao atualizar histórico:', error);
      toast.error('Falha ao atualizar histórico');
    }
  });

  // Use appropriate data source
  const objectives = useMemo(() => {
    if (remoteObjectives.length > 0) {
      return remoteObjectives;
    }
    return localObjectives;
  }, [remoteObjectives, localObjectives]);

  // Filter history data by date range
  const filteredHistoryData = useMemo(() => {
    return filterByDateRange(historyData, dateRangeFilter);
  }, [historyData, dateRangeFilter]);

  // Process objectives history
  const objectiveHistory = useMemo(() => {
    return generateObjectiveHistory(objectives, rawHistoryData);
  }, [objectives, rawHistoryData, forceRefresh]);

  // Calculate overall progress history
  const overallProgressHistory = useMemo(() => {
    return calculateOverallProgressHistory(rawHistoryData);
  }, [rawHistoryData, forceRefresh]);

  // Get the current overall progress
  const currentOverallProgress = useMemo(() => {
    if (!objectives || objectives.length === 0) return 0;
    
    const totalProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0);
    return Math.round(totalProgress / objectives.length);
  }, [objectives]);

  // Refresh history data
  const refreshHistory = useCallback(() => {
    setForceRefresh(prev => prev + 1);
  }, []);

  const isLoading = isLoadingObjectives || isLoadingHistory;
  const hasHistoryData = filteredHistoryData && filteredHistoryData.length > 0;
  const hasObjectives = objectives && objectives.length > 0;

  return {
    isLoading,
    isUpdating,
    objectiveHistory,
    overallProgressHistory,
    objectives,
    hasHistoryData,
    hasObjectives,
    currentOverallProgress,
    dateRangeFilter,
    setDateRangeFilter,
    updateHistory,
    refreshHistory
  };
};
