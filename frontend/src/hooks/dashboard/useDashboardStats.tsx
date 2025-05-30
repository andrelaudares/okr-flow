import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { 
  DashboardStats, 
  ProgressData, 
  ObjectivesCount, 
  EvolutionData,
  TimeCardsResponse 
} from '@/types/dashboard';

interface UseDashboardStatsProps {
  cycleCode?: string;
  cycleYear?: number;
  autoRefresh?: boolean;
}

interface UseDashboardStatsReturn {
  // Data
  stats: DashboardStats | null;
  progress: ProgressData | null;
  objectivesCount: ObjectivesCount | null;
  evolution: EvolutionData | null;
  timeCards: TimeCardsResponse | null;
  
  // Loading states
  isLoadingStats: boolean;
  isLoadingProgress: boolean;
  isLoadingCount: boolean;
  isLoadingEvolution: boolean;
  isLoadingTimeCards: boolean;
  isLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
  refetchStats: () => Promise<void>;
  refetchProgress: () => Promise<void>;
  refetchCount: () => Promise<void>;
  refetchEvolution: () => Promise<void>;
  refetchTimeCards: () => Promise<void>;
}

export const useDashboardStats = ({
  cycleCode,
  cycleYear,
  autoRefresh = true
}: UseDashboardStatsProps = {}): UseDashboardStatsReturn => {
  const { isAuthenticated } = useAuth();
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [objectivesCount, setObjectivesCount] = useState<ObjectivesCount | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [timeCards, setTimeCards] = useState<TimeCardsResponse | null>(null);
  
  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isLoadingEvolution, setIsLoadingEvolution] = useState(false);
  const [isLoadingTimeCards, setIsLoadingTimeCards] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch functions
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingStats(true);
    
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (err: any) {
      console.warn('Erro ao carregar estatísticas (não crítico):', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [isAuthenticated]);

  const fetchProgress = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingProgress(true);
    
    try {
      const params = new URLSearchParams();
      if (cycleCode) params.append('cycle_code', cycleCode);
      if (cycleYear) params.append('cycle_year', cycleYear.toString());
      
      const url = `/api/dashboard/progress${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      setProgress(response.data);
    } catch (err: any) {
      console.warn('Erro ao carregar progresso (não crítico):', err);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [isAuthenticated, cycleCode, cycleYear]);

  const fetchObjectivesCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingCount(true);
    
    try {
      const response = await api.get('/api/dashboard/objectives-count');
      setObjectivesCount(response.data);
    } catch (err: any) {
      console.warn('Erro ao carregar contadores (não crítico):', err);
    } finally {
      setIsLoadingCount(false);
    }
  }, [isAuthenticated]);

  const fetchEvolution = useCallback(async () => {
    if (!isAuthenticated) return;
    
    // TEMPORARIAMENTE DESABILITADO - Erro de conversão de datas
    // TODO: Reabilitar quando o erro de datas for resolvido definitivamente
    console.log('DEBUG: fetchEvolution desabilitado temporariamente devido a erro de datas');
    return;
    
    /*
    setIsLoadingEvolution(true);
    setError(null);
    
    try {
      const response = await api.get('/api/dashboard/evolution');
      setEvolution(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar evolução:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar evolução');
    } finally {
      setIsLoadingEvolution(false);
    }
    */
  }, [isAuthenticated]);

  const fetchTimeCards = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingTimeCards(true);
    
    try {
      const response = await api.get('/api/dashboard/time-cards');
      setTimeCards(response.data);
    } catch (err: any) {
      console.warn('Erro ao carregar cards temporais (não crítico):', err);
    } finally {
      setIsLoadingTimeCards(false);
    }
  }, [isAuthenticated]);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchProgress(),
      fetchObjectivesCount(),
      // fetchEvolution(), // TEMPORARIAMENTE DESABILITADO
      fetchTimeCards()
    ]);
  }, [fetchStats, fetchProgress, fetchObjectivesCount, fetchTimeCards]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && autoRefresh) {
      refetch();
    }
  }, [isAuthenticated, autoRefresh, cycleCode, cycleYear, refetch]);

  const isLoading = isLoadingStats || isLoadingProgress || isLoadingCount || isLoadingTimeCards;

  return {
    // Data
    stats,
    progress,
    objectivesCount,
    evolution,
    timeCards,
    
    // Loading states
    isLoadingStats,
    isLoadingProgress,
    isLoadingCount,
    isLoadingEvolution,
    isLoadingTimeCards,
    isLoading,
    
    // Error state
    error,
    
    // Actions
    refetch,
    refetchStats: fetchStats,
    refetchProgress: fetchProgress,
    refetchCount: fetchObjectivesCount,
    refetchEvolution: fetchEvolution,
    refetchTimeCards: fetchTimeCards
  };
}; 