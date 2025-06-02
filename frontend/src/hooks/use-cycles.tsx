import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Cycle, CreateCycleData, UpdateCycleData } from '@/types/cycles';

// Hook para gestão de ciclos
export const useCycles = () => {
  const queryClient = useQueryClient();
  
  // Estado para controlar se está no cliente (fix para SSR)
  const [isClient, setIsClient] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Effect para verificar se está no cliente e se tem token
  useEffect(() => {
    setIsClient(true);
    setHasToken(!!localStorage.getItem('nobugOkrToken'));
  }, []);

  // Query para listar ciclos
  const {
    data: cycles,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cycles'],
    queryFn: async (): Promise<Cycle[]> => {
      const response = await api.get('/api/cycles/');
      return response.data;
    },
    enabled: isClient && hasToken, // Só executa no cliente e com token
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para ciclo ativo
  const {
    data: activeCycle,
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ['cycles', 'active'],
    queryFn: async (): Promise<Cycle | null> => {
      try {
        const response = await api.get('/api/cycles/active');
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // Nenhum ciclo ativo
        }
        throw error;
      }
    },
    enabled: isClient && hasToken, // Só executa no cliente e com token
    staleTime: 5 * 60 * 1000,
  });

  // Query para buscar ciclo específico
  const getCycleById = (cycleId: string) => {
    return useQuery({
      queryKey: ['cycle', cycleId],
      queryFn: async (): Promise<Cycle> => {
        const response = await api.get(`/api/cycles/${cycleId}`);
        return response.data;
      },
      enabled: !!cycleId && isClient && hasToken,
    });
  };

  // Mutation para criar ciclo
  const createCycleMutation = useMutation({
    mutationFn: async (data: CreateCycleData): Promise<Cycle> => {
      const response = await api.post('/api/cycles/', data);
      return response.data;
    },
    onSuccess: (newCycle) => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      toast.success(`Ciclo ${newCycle.name} criado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao criar ciclo:', error);
      toast.error(error.message || 'Erro ao criar ciclo');
    },
  });

  // Mutation para atualizar ciclo
  const updateCycleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCycleData }): Promise<Cycle> => {
      const response = await api.put(`/api/cycles/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedCycle) => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      queryClient.invalidateQueries({ queryKey: ['cycle', updatedCycle.id] });
      toast.success(`Ciclo ${updatedCycle.name} atualizado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar ciclo:', error);
      toast.error(error.message || 'Erro ao atualizar ciclo');
    },
  });

  // Mutation para ativar ciclo
  const activateCycleMutation = useMutation({
    mutationFn: async (cycleId: string): Promise<Cycle> => {
      const response = await api.post(`/api/cycles/${cycleId}/activate`);
      return response.data;
    },
    onSuccess: (activatedCycle) => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      queryClient.invalidateQueries({ queryKey: ['cycles', 'active'] });
      toast.success(`Ciclo ${activatedCycle.name} ativado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao ativar ciclo:', error);
      toast.error(error.message || 'Erro ao ativar ciclo');
    },
  });

  // Mutation para deletar ciclo
  const deleteCycleMutation = useMutation({
    mutationFn: async (cycleId: string): Promise<void> => {
      await api.delete(`/api/cycles/${cycleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      toast.success('Ciclo deletado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar ciclo:', error);
      toast.error(error.message || 'Erro ao deletar ciclo');
    },
  });

  return {
    // Dados
    cycles: cycles || [],
    activeCycle,
    
    // Estados
    isLoading,
    isLoadingActive,
    isError: !!error,
    error,
    
    // Estados das mutations
    isCreating: createCycleMutation.isPending,
    isUpdating: updateCycleMutation.isPending,
    isActivating: activateCycleMutation.isPending,
    isDeleting: deleteCycleMutation.isPending,
    
    // Funções
    createCycle: createCycleMutation.mutateAsync,
    updateCycle: (id: string, data: UpdateCycleData) => 
      updateCycleMutation.mutateAsync({ id, data }),
    activateCycle: activateCycleMutation.mutateAsync,
    deleteCycle: deleteCycleMutation.mutateAsync,
    getCycleById,
    refetch,
    refetchActive,
  };
}; 