import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { 
  KeyResult, 
  CreateKeyResultData, 
  UpdateKeyResultData, 
  KeyResultFilters, 
  KeyResultsResponse 
} from '@/types/key-results';

// Hook para gestão de Key Results
export const useKeyResults = (objectiveId: string, filters?: KeyResultFilters) => {
  const queryClient = useQueryClient();

  // Query para listar Key Results de um objetivo
  const {
    data: keyResultsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['key-results', objectiveId, filters],
    queryFn: async (): Promise<KeyResultsResponse> => {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status.length > 0) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters?.owner_id) params.append('owner_id', filters.owner_id);
      if (filters?.unit) params.append('unit', filters.unit);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`/api/objectives/${objectiveId}/key-results?${params.toString()}`);
      return response.data;
    },
    enabled: !!objectiveId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Query para buscar Key Result específico
  const getKeyResultById = (keyResultId: string) => {
    return useQuery({
      queryKey: ['key-result', keyResultId],
      queryFn: async (): Promise<KeyResult> => {
        const response = await api.get(`/api/objectives/key-results/${keyResultId}`);
        return response.data;
      },
      enabled: !!keyResultId,
    });
  };

  // Mutation para criar Key Result
  const createKeyResultMutation = useMutation({
    mutationFn: async (data: CreateKeyResultData): Promise<KeyResult> => {
      const response = await api.post(`/api/objectives/${objectiveId}/key-results`, data);
      return response.data;
    },
    onSuccess: (newKeyResult) => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Key Result "${newKeyResult.title}" criado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao criar Key Result:', error);
      toast.error(error.response?.data?.detail || 'Erro ao criar Key Result');
    },
  });

  // Mutation para atualizar Key Result
  const updateKeyResultMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateKeyResultData }): Promise<KeyResult> => {
      const response = await api.put(`/api/objectives/key-results/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedKeyResult) => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['key-result', updatedKeyResult.id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Key Result "${updatedKeyResult.title}" atualizado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar Key Result:', error);
      toast.error(error.response?.data?.detail || 'Erro ao atualizar Key Result');
    },
  });

  // Mutation para deletar Key Result
  const deleteKeyResultMutation = useMutation({
    mutationFn: async (keyResultId: string): Promise<void> => {
      await api.delete(`/api/objectives/key-results/${keyResultId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Key Result deletado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar Key Result:', error);
      toast.error(error.response?.data?.detail || 'Erro ao deletar Key Result');
    },
  });

  return {
    // Dados
    keyResults: keyResultsData?.key_results || [],
    total: keyResultsData?.total || 0,
    hasMore: keyResultsData?.has_more || false,
    filtersApplied: keyResultsData?.filters_applied || {},
    
    // Estados
    isLoading,
    isError: !!error,
    error,
    
    // Estados das mutations
    isCreating: createKeyResultMutation.isPending,
    isUpdating: updateKeyResultMutation.isPending,
    isDeleting: deleteKeyResultMutation.isPending,
    
    // Funções
    createKeyResult: createKeyResultMutation.mutateAsync,
    updateKeyResult: (id: string, data: UpdateKeyResultData) => 
      updateKeyResultMutation.mutateAsync({ id, data }),
    deleteKeyResult: deleteKeyResultMutation.mutateAsync,
    getKeyResultById,
    refetch,
  };
};

// Hook para filtros de Key Results
export const useKeyResultFilters = () => {
  const [filters, setFilters] = React.useState<KeyResultFilters>({
    search: '',
    status: [],
    owner_id: '',
    unit: '',
    limit: 50,
    offset: 0,
  });

  const updateFilter = (key: keyof KeyResultFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: key !== 'offset' ? 0 : value, // Reset offset quando outros filtros mudam
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      owner_id: '',
      unit: '',
      limit: 50,
      offset: 0,
    });
  };

  const nextPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 50),
    }));
  };

  const prevPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 50)),
    }));
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    nextPage,
    prevPage,
  };
}; 