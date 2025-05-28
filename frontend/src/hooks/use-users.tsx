import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UsersListResponse, 
  UserFilters 
} from '@/types/auth';

// Hook principal para gestão de usuários
export const useUsers = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({
    limit: 10,
    offset: 0,
  });

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
    enabled: !!localStorage.getItem('nobugOkrToken'),
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
  const limit = filters.limit || 10;
  const offset = filters.offset || 0;
  const currentPage = Math.floor(offset / limit);
  const totalPages = Math.ceil((usersData?.total || 0) / limit);

  // Funções de filtros e paginação
  const applyFilters = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset para primeira página
    }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 10,
      offset: 0,
    });
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setFilters(prev => ({
        ...prev,
        offset: (currentPage + 1) * limit,
      }));
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setFilters(prev => ({
        ...prev,
        offset: (currentPage - 1) * limit,
      }));
    }
  };

  const setPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setFilters(prev => ({
        ...prev,
        offset: page * limit,
      }));
    }
  };

  return {
    // Dados
    users: usersData?.users || [],
    total: usersData?.total || 0,
    hasMore: usersData?.has_more || false,
    
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
    
    // Filtros
    filters,
    applyFilters,
    clearFilters,
    nextPage,
    prevPage,
    setPage,
  };
};

// Hook para filtros de usuários (mantido para compatibilidade)
export const useUserFilters = () => {
  const queryClient = useQueryClient();

  const applyFilters = (filters: UserFilters) => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const clearFilters = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  return {
    applyFilters,
    clearFilters,
  };
};
