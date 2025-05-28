import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { 
  Checkin, 
  CreateCheckinData, 
  UpdateCheckinData, 
  CheckinsResponse 
} from '@/types/key-results';

// Hook para gestão de Check-ins
export const useCheckins = (keyResultId: string) => {
  const queryClient = useQueryClient();

  // Query para listar Check-ins de um Key Result
  const {
    data: checkinsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['checkins', keyResultId],
    queryFn: async (): Promise<CheckinsResponse> => {
      const response = await api.get(`/api/objectives/key-results/${keyResultId}/checkins`);
      return response.data;
    },
    enabled: !!keyResultId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  // Mutation para criar Check-in
  const createCheckinMutation = useMutation({
    mutationFn: async (data: CreateCheckinData): Promise<Checkin> => {
      const response = await api.post(`/api/objectives/key-results/${keyResultId}/checkins`, data);
      return response.data;
    },
    onSuccess: (newCheckin) => {
      queryClient.invalidateQueries({ queryKey: ['checkins', keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Check-in registrado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar check-in:', error);
      toast.error(error.response?.data?.detail || 'Erro ao registrar check-in');
    },
  });

  // Mutation para atualizar Check-in
  const updateCheckinMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCheckinData }): Promise<Checkin> => {
      const response = await api.put(`/api/objectives/checkins/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedCheckin) => {
      queryClient.invalidateQueries({ queryKey: ['checkins', keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Check-in atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar check-in:', error);
      toast.error(error.response?.data?.detail || 'Erro ao atualizar check-in');
    },
  });

  // Mutation para deletar Check-in
  const deleteCheckinMutation = useMutation({
    mutationFn: async (checkinId: string): Promise<void> => {
      await api.delete(`/api/objectives/checkins/${checkinId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins', keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Check-in deletado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar check-in:', error);
      toast.error(error.response?.data?.detail || 'Erro ao deletar check-in');
    },
  });

  return {
    // Dados
    checkins: checkinsData?.checkins || [],
    total: checkinsData?.total || 0,
    
    // Estados
    isLoading,
    isError: !!error,
    error,
    
    // Estados das mutations
    isCreating: createCheckinMutation.isPending,
    isUpdating: updateCheckinMutation.isPending,
    isDeleting: deleteCheckinMutation.isPending,
    
    // Funções
    createCheckin: createCheckinMutation.mutateAsync,
    updateCheckin: (id: string, data: UpdateCheckinData) => 
      updateCheckinMutation.mutateAsync({ id, data }),
    deleteCheckin: deleteCheckinMutation.mutateAsync,
    refetch,
  };
}; 