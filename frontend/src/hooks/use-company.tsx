import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Company, UpdateCompanyData } from '@/types/company';

// Hook para gestão da empresa
export const useCompany = () => {
  const queryClient = useQueryClient();

  // Query para buscar perfil da empresa
  const {
    data: company,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['company', 'profile'],
    queryFn: async (): Promise<Company> => {
      const response = await api.get('/api/companies/profile');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para atualizar empresa
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: UpdateCompanyData): Promise<Company> => {
      const response = await api.put('/api/companies/profile', data);
      return response.data;
    },
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success(`Empresa ${updatedCompany.name} atualizada com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar empresa:', error);
      toast.error(error.message || 'Erro ao atualizar empresa');
    },
  });

  return {
    // Dados
    company,
    
    // Estados
    isLoading,
    isError: !!error,
    error,
    isUpdating: updateCompanyMutation.isPending,
    
    // Funções
    updateCompany: updateCompanyMutation.mutateAsync,
    refetch,
  };
}; 