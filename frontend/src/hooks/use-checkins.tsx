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

  // Query para buscar Check-ins
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
    enabled: !!keyResultId && !!localStorage.getItem('nobugOkrToken'),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  // Mutation para criar Check-in
  const createMutation = useMutation({
    mutationFn: async (data: CreateCheckinData): Promise<Checkin> => {
      const response = await api.post(`/api/objectives/key-results/${keyResultId}/checkins`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins', keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Check-in registrado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar check-in:', error);
      toast.error(error.message || 'Erro ao registrar check-in');
    },
  });

  // Mutation para atualizar Check-in
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCheckinData }): Promise<Checkin> => {
      const response = await api.put(`/api/objectives/checkins/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins', keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Check-in atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar check-in:', error);
      toast.error(error.message || 'Erro ao atualizar check-in');
    },
  });

  // Mutation para deletar Check-in
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/objectives/checkins/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins', keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Check-in excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir check-in:', error);
      toast.error(error.message || 'Erro ao excluir check-in');
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
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Funções
    createCheckin: createMutation.mutateAsync,
    updateCheckin: (id: string, data: UpdateCheckinData) => 
      updateMutation.mutateAsync({ id, data }),
    deleteCheckin: deleteMutation.mutateAsync,
    refetch,
  };
}; 