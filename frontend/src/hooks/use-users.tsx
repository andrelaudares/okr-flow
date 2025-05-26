import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UsersListResponse, 
  UserFilters 
} from '@/types/auth';

interface UseUsersOptions {
  filters?: UserFilters;
}

// Hook principal para gestão de usuários
export const useUsers = (options: UseUsersOptions = {}) => {
  const queryClient = useQueryClient();
  const { filters = {} } = options;

  // Query para listar usuários
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: async (): Promise<UsersListResponse> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`/api/users/?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData): Promise<User> => {
      const response = await api.post('/api/users/', userData);
      return response.data;
    },
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Usuário ${newUser.name} criado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }): Promise<User> => {
      const response = await api.put(`/api/users/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Usuário ${updatedUser.name} atualizado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.message || 'Erro ao atualizar usuário');
    },
  });

  // Mutation para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await api.delete(`/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário desativado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao desativar usuário:', error);
      toast.error(error.message || 'Erro ao desativar usuário');
    },
  });

  // Query para buscar usuário específico
  const getUserById = (userId: string) => {
    return useQuery({
      queryKey: ['user', userId],
      queryFn: async (): Promise<User> => {
        const response = await api.get(`/api/users/${userId}`);
        return response.data;
      },
      enabled: !!userId,
    });
  };

  // Calcular paginação
  const limit = usersData?.filters_applied.limit || 10;
  const offset = usersData?.filters_applied.offset || 0;
  const currentPage = Math.floor(offset / limit);
  const totalPages = Math.ceil((usersData?.total || 0) / limit);

  return {
    // Dados
    users: usersData?.users || [],
    total: usersData?.total || 0,
    hasMore: usersData?.has_more || false,
    filtersApplied: usersData?.filters_applied || {},
    
    // Estados de carregamento
    isLoading,
    isError: !!error,
    error,
    
    // Mutations estados
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    
    // Funções
    createUser: createUserMutation.mutateAsync,
    updateUser: (id: string, data: UpdateUserData) => 
      updateUserMutation.mutateAsync({ id, data }),
    deleteUser: deleteUserMutation.mutateAsync,
    refetch,
    getUserById,
    
    // Paginação
    currentPage,
    totalPages,
    limit,
    offset,
    
    // Filtros - criar funções auxiliares
    filters: usersData?.filters_applied || {},
    applyFilters: (newFilters: UserFilters) => {
      // Invalidar e refetch com novos filtros seria implementado aqui
      // Por agora, vamos fazer refetch simples
      refetch();
    },
    clearFilters: () => {
      refetch();
    },
    nextPage: () => {
      if (currentPage < totalPages - 1) {
        refetch();
      }
    },
    prevPage: () => {
      if (currentPage > 0) {
        refetch();
      }
    },
    setPage: (page: number) => {
      refetch();
    },
  };
};

// Hook para filtros de usuários
export const useUserFilters = () => {
  const queryClient = useQueryClient();

  const applyFilters = (filters: UserFilters) => {
    // Invalidar queries com novos filtros
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const clearFilters = () => {
    // Invalidar queries sem filtros
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  return {
    applyFilters,
    clearFilters,
  };
};
