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
export const useKeyResults = (objectiveId: string, filters: KeyResultFilters = {}) => {
  const queryClient = useQueryClient();

  // Query para buscar Key Results
  const {
    data: keyResultsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['key-results', objectiveId, filters],
    queryFn: async (): Promise<KeyResultsResponse> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.owner_id) params.append('owner_id', filters.owner_id);
      if (filters.unit) params.append('unit', filters.unit);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`/api/objectives/${objectiveId}/key-results?${params}`);
      return response.data;
    },
    enabled: !!objectiveId && !!localStorage.getItem('nobugOkrToken'),
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
  const createMutation = useMutation({
    mutationFn: async (data: CreateKeyResultData): Promise<KeyResult> => {
      const response = await api.post(`/api/objectives/${objectiveId}/key-results`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Key Result criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar Key Result:', error);
      toast.error(error.message || 'Erro ao criar Key Result');
    },
  });

  // Mutation para atualizar Key Result
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateKeyResultData }): Promise<KeyResult> => {
      const response = await api.put(`/api/objectives/key-results/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Key Result atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar Key Result:', error);
      toast.error(error.message || 'Erro ao atualizar Key Result');
    },
  });

  // Mutation para deletar Key Result
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/objectives/key-results/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Key Result excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir Key Result:', error);
      toast.error(error.message || 'Erro ao excluir Key Result');
    },
  });

  return {
    // Dados
    keyResults: keyResultsData?.metas || [],
    total: keyResultsData?.total || 0,
    hasMore: keyResultsData?.has_more || false,
    filtersApplied: keyResultsData?.filters_applied || {},
    
    // Estados
    isLoading,
    isError: !!error,
    error,
    
    // Estados das mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Funções
    createKeyResult: createMutation.mutateAsync,
    updateKeyResult: (id: string, data: UpdateKeyResultData) => 
      updateMutation.mutateAsync({ id, data }),
    deleteKeyResult: deleteMutation.mutateAsync,
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