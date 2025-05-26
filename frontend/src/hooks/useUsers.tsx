import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { get, post, put, del } from '@/lib/api';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UsersListResponse,
  UserFilters
} from '@/types/auth';

// Query keys
const QUERY_KEYS = {
  users: 'users',
  usersList: (filters: UserFilters) => ['users', 'list', filters],
  user: (id: string) => ['users', id],
} as const;

export const useUsers = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({
    limit: 10,
    offset: 0,
  });

  // Query para listar usuários
  const usersQuery = useQuery({
    queryKey: QUERY_KEYS.usersList(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.offset) params.append('offset', String(filters.offset));
      
      return get<UsersListResponse>(`/api/users/?${params.toString()}`);
    },
    staleTime: 30000, // 30 segundos
  });

  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) => post<User>('/api/users/', userData),
    onSuccess: (newUser) => {
      // Invalidar queries de usuários
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
      toast.success(`Usuário ${newUser.name} criado com sucesso!`);
    },
    onError: (error) => {
      console.error('Create user error:', error);
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => 
      put<User>(`/api/users/${id}`, data),
    onSuccess: (updatedUser) => {
      // Invalidar queries de usuários
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
      // Atualizar cache do usuário específico
      queryClient.setQueryData(QUERY_KEYS.user(updatedUser.id), updatedUser);
      toast.success(`Usuário ${updatedUser.name} atualizado com sucesso!`);
    },
    onError: (error) => {
      console.error('Update user error:', error);
    },
  });

  // Mutation para desativar usuário
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => del(`/api/users/${id}`),
    onSuccess: (_, userId) => {
      // Invalidar queries de usuários
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
      toast.success('Usuário desativado com sucesso!');
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    },
  });

  // Funções para filtros
  const applyFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ limit: 10, offset: 0 });
  }, []);

  const nextPage = useCallback(() => {
    if (usersQuery.data?.has_more) {
      setFilters(prev => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 10),
      }));
    }
  }, [usersQuery.data?.has_more]);

  const prevPage = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 10)),
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    const limit = filters.limit || 10;
    setFilters(prev => ({
      ...prev,
      offset: page * limit,
    }));
  }, [filters.limit]);

  // Estados derivados
  const users = usersQuery.data?.users || [];
  const total = usersQuery.data?.total || 0;
  const hasMore = usersQuery.data?.has_more || false;
  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 10));
  const totalPages = Math.ceil(total / (filters.limit || 10));

  return {
    // Dados
    users,
    total,
    hasMore,
    currentPage,
    totalPages,
    filters,
    
    // Estados de loading
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    
    // Mutations
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    
    // Funções de filtro e paginação
    applyFilters,
    clearFilters,
    nextPage,
    prevPage,
    setPage,
    
    // Refresh
    refetch: usersQuery.refetch,
  };
};

// Hook para buscar usuário específico
export const useUser = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => get<User>(`/api/users/${id}`),
    enabled: !!id,
    staleTime: 60000, // 1 minuto
  });
};

export default useUsers; 