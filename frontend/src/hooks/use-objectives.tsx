import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { 
  Objective, 
  CreateObjectiveData, 
  UpdateObjectiveData, 
  ObjectiveFilters, 
  ObjectivesResponse, 
  ObjectiveStats,
  ObjectiveWithDetails 
} from '@/types/objectives';

// Hook para gestão de objetivos
export const useObjectives = (filters?: ObjectiveFilters) => {
  const queryClient = useQueryClient();

  // Query para listar objetivos
  const {
    data: objectivesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['objectives', filters],
    queryFn: async (): Promise<ObjectivesResponse> => {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status.length > 0) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters?.owner_id) params.append('owner_id', filters.owner_id);
      if (filters?.cycle_id) params.append('cycle_id', filters.cycle_id);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`/api/objectives/?${params.toString()}`);
      return response.data;
    },
    enabled: !!localStorage.getItem('nobugOkrToken'),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Query para estatísticas de objetivos
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['objectives', 'stats'],
    queryFn: async (): Promise<ObjectiveStats> => {
      const response = await api.get('/api/objectives/stats/summary');
      return response.data;
    },
    enabled: !!localStorage.getItem('nobugOkrToken'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar objetivo específico
  const getObjectiveById = (objectiveId: string) => {
    return useQuery({
      queryKey: ['objective', objectiveId],
      queryFn: async (): Promise<ObjectiveWithDetails> => {
        const response = await api.get(`/api/objectives/${objectiveId}`);
        return response.data;
      },
      enabled: !!objectiveId,
    });
  };

  // Mutation para criar objetivo
  const createObjectiveMutation = useMutation({
    mutationFn: async (data: CreateObjectiveData): Promise<Objective> => {
      const response = await api.post('/api/objectives/', data);
      return response.data;
    },
    onSuccess: (newObjective) => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Objetivo "${newObjective.title}" criado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao criar objetivo:', error);
      toast.error(error.response?.data?.detail || 'Erro ao criar objetivo');
    },
  });

  // Mutation para atualizar objetivo
  const updateObjectiveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateObjectiveData }): Promise<Objective> => {
      const response = await api.put(`/api/objectives/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedObjective) => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objective', updatedObjective.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Objetivo "${updatedObjective.title}" atualizado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar objetivo:', error);
      toast.error(error.response?.data?.detail || 'Erro ao atualizar objetivo');
    },
  });

  // Mutation para deletar objetivo
  const deleteObjectiveMutation = useMutation({
    mutationFn: async (objectiveId: string): Promise<void> => {
      await api.delete(`/api/objectives/${objectiveId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Objetivo deletado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar objetivo:', error);
      toast.error(error.response?.data?.detail || 'Erro ao deletar objetivo');
    },
  });

  return {
    // Dados
    objectives: objectivesData?.objectives || [],
    total: objectivesData?.total || 0,
    hasMore: objectivesData?.has_more || false,
    filtersApplied: objectivesData?.filters_applied || {},
    stats,
    
    // Estados
    isLoading,
    isLoadingStats,
    isError: !!error,
    error,
    
    // Estados das mutations
    isCreating: createObjectiveMutation.isPending,
    isUpdating: updateObjectiveMutation.isPending,
    isDeleting: deleteObjectiveMutation.isPending,
    
    // Funções
    createObjective: createObjectiveMutation.mutateAsync,
    updateObjective: (id: string, data: UpdateObjectiveData) => 
      updateObjectiveMutation.mutateAsync({ id, data }),
    deleteObjective: deleteObjectiveMutation.mutateAsync,
    getObjectiveById,
    refetch,
    refetchStats,
  };
};

// Hook para filtros de objetivos
export const useObjectiveFilters = () => {
  const [filters, setFilters] = React.useState<ObjectiveFilters>({
    search: '',
    status: [],
    owner_id: '',
    cycle_id: '',
    limit: 50,
    offset: 0,
  });

  const updateFilter = (key: keyof ObjectiveFilters, value: any) => {
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
      cycle_id: '',
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
