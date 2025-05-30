import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { 
  GlobalCycleWithStatus, 
  UserCyclePreference, 
  CyclePreferenceUpdate 
} from '@/types/global-cycles';

interface UseGlobalCyclesReturn {
  // Dados
  globalCycles: GlobalCycleWithStatus[];
  userPreference: GlobalCycleWithStatus | null;
  currentCycle: GlobalCycleWithStatus | null;
  availableYears: number[];
  
  // Estados
  isLoading: boolean;
  isLoadingPreference: boolean;
  isUpdatingPreference: boolean;
  error: string | null;
  
  // Ações
  fetchGlobalCycles: (year?: number) => Promise<void>;
  fetchUserPreference: () => Promise<void>;
  fetchCurrentCycle: () => Promise<void>;
  updateUserPreference: (preference: CyclePreferenceUpdate) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useGlobalCycles = (autoFetch = true): UseGlobalCyclesReturn => {
  const [globalCycles, setGlobalCycles] = useState<GlobalCycleWithStatus[]>([]);
  const [userPreference, setUserPreference] = useState<GlobalCycleWithStatus | null>(null);
  const [currentCycle, setCurrentCycle] = useState<GlobalCycleWithStatus | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreference, setIsLoadingPreference] = useState(false);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalCycles = async (year?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = year ? { year } : {};
      const response = await api.get<GlobalCycleWithStatus[]>('/api/global-cycles/global', { params });
      
      setGlobalCycles(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao carregar ciclos globais';
      setError(errorMsg);
      console.error('Erro ao buscar ciclos globais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPreference = async () => {
    try {
      setIsLoadingPreference(true);
      setError(null);
      
      const response = await api.get<GlobalCycleWithStatus>('/api/global-cycles/user-preference');
      
      setUserPreference(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao carregar preferência do usuário';
      setError(errorMsg);
      console.error('Erro ao buscar preferência:', error);
    } finally {
      setIsLoadingPreference(false);
    }
  };

  const fetchCurrentCycle = async () => {
    try {
      setError(null);
      
      const response = await api.get<GlobalCycleWithStatus>('/api/global-cycles/current');
      
      setCurrentCycle(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao carregar ciclo atual';
      setError(errorMsg);
      console.error('Erro ao buscar ciclo atual:', error);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const response = await api.get<number[]>('/api/global-cycles/available-years');
      setAvailableYears(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar anos disponíveis:', error);
    }
  };

  const updateUserPreference = async (preference: CyclePreferenceUpdate) => {
    try {
      setIsUpdatingPreference(true);
      setError(null);
      
      const response = await api.put<UserCyclePreference>(
        '/api/global-cycles/user-preference', 
        preference
      );
      
      // Recarregar preferência após atualização
      await fetchUserPreference();
      
      toast.success('Preferência de ciclo atualizada com sucesso!');
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao atualizar preferência';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Erro ao atualizar preferência:', error);
      throw error;
    } finally {
      setIsUpdatingPreference(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchGlobalCycles(),
      fetchUserPreference(),
      fetchCurrentCycle(),
      fetchAvailableYears(),
    ]);
  };

  // Auto-fetch na inicialização
  useEffect(() => {
    if (autoFetch) {
      refreshAll();
    }
  }, [autoFetch]);

  return {
    // Dados
    globalCycles,
    userPreference,
    currentCycle,
    availableYears,
    
    // Estados
    isLoading,
    isLoadingPreference,
    isUpdatingPreference,
    error,
    
    // Ações
    fetchGlobalCycles,
    fetchUserPreference,
    fetchCurrentCycle,
    updateUserPreference,
    refreshAll,
  };
};

export default useGlobalCycles; 