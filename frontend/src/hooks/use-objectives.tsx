import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Objective } from '@/types/okr';

// Interface para criar objetivo
interface CreateObjectiveData {
  title: string;
  description?: string;
  owner_id?: string;
  cycle_id?: string;
}

// Interface para resposta da API
interface ObjectivesResponse {
  objectives: Objective[];
  total: number;
  has_more: boolean;
}

// Hook principal para objetivos
export const useObjectives = () => {
  const queryClient = useQueryClient();

  // Query para listar objetivos
  const {
    data: objectivesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['objectives'],
    queryFn: async (): Promise<ObjectivesResponse> => {
      try {
        const response = await api.get('/api/objectives/');
        return response.data;
      } catch (error) {
        console.error('Erro ao carregar objetivos:', error);
        // Se der erro, retornar dados vazios para não crashar
        return {
          objectives: [],
          total: 0,
          has_more: false
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1, // Tentar apenas 1 vez
  });

  // Mutation para criar objetivo
  const addObjectiveMutation = useMutation({
    mutationFn: async (data: CreateObjectiveData): Promise<Objective> => {
      const response = await api.post('/api/objectives/', data);
      return response.data;
    },
    onSuccess: (newObjective) => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success(`Objetivo "${newObjective.title}" criado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao criar objetivo:', error);
      toast.error('Erro ao criar objetivo');
    },
  });

  // Mutation para deletar objetivo
  const deleteObjectiveMutation = useMutation({
    mutationFn: async (objectiveId: string): Promise<void> => {
      await api.delete(`/api/objectives/${objectiveId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Objetivo removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar objetivo:', error);
      toast.error('Erro ao remover objetivo');
    },
  });

  // Funções auxiliares para compatibilidade com o código existente
  const addObjective = async (data: { title: string; description: string }): Promise<boolean> => {
    try {
      await addObjectiveMutation.mutateAsync({
        title: data.title,
        description: data.description
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteObjective = (objectiveId: string) => {
    deleteObjectiveMutation.mutate(objectiveId);
  };

  // Funções de atividades (por enquanto vazias, serão implementadas depois)
  const addActivity = (objectiveId: string, activity: any) => {
    console.log('addActivity será implementado na próxima fase');
    toast.info('Gestão de atividades será implementada na próxima fase');
  };

  const updateActivity = (objectiveId: string, activity: any) => {
    console.log('updateActivity será implementado na próxima fase');
    toast.info('Gestão de atividades será implementada na próxima fase');
  };

  const deleteActivity = (objectiveId: string, activityId: string) => {
    console.log('deleteActivity será implementado na próxima fase');
    toast.info('Gestão de atividades será implementada na próxima fase');
  };

  return {
    // Dados
    objectives: objectivesData?.objectives || [],
    total: objectivesData?.total || 0,
    
    // Estados
    isLoading,
    error,
    
    // Funções
    addObjective,
    deleteObjective,
    addActivity,
    updateActivity,
    deleteActivity,
    refetch,
    
    // Mutations estados
    isAddingObjective: addObjectiveMutation.isPending,
    isDeletingObjective: deleteObjectiveMutation.isPending,
  };
};
