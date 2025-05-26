import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth, usePermissions } from '@/hooks/use-auth';
import { useUsers } from '@/hooks/use-users';
import { toast } from 'sonner';
import AddUserForm from '@/components/users/add-user-form';
import EditUserForm from '@/components/users/edit-user-form';
import { Loading } from '@/components/ui/loading';
import type { User, UserRole } from '@/types/auth';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { canManageUsers, isOwner, isAdmin } = usePermissions();
  const {
    users,
    total,
    currentPage,
    totalPages,
    filters,
    isLoading,
    isError,
    applyFilters,
    clearFilters,
    nextPage,
    prevPage,
    setPage,
    deleteUser,
    isDeleting,
  } = useUsers();

  const [search, setSearch] = useState(filters.search || '');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Aplicar filtros
  const handleSearch = () => {
    applyFilters({
      search: search || undefined,
      role: roleFilter !== 'ALL' ? roleFilter : undefined,
      is_active: statusFilter !== 'ALL' ? statusFilter === 'ACTIVE' : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    clearFilters();
  };

  const handleDeleteUser = async (user: User) => {
    if (!canManageUsers) {
      toast.error('Você não tem permissão para excluir usuários.');
      return;
    }

    if (user.id === currentUser?.id) {
      toast.error('Você não pode excluir sua própria conta.');
      return;
    }

    if (user.is_owner && !isOwner) {
      toast.error('Apenas o owner pode excluir outros owners.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja desativar o usuário ${user.name}?`)) {
      try {
        deleteUser(user.id);
        toast.success(`Usuário ${user.name} foi desativado.`);
      } catch (error) {
        console.error('Delete user error:', error);
      }
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'COLLABORATOR':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'Proprietário';
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'COLLABORATOR':
        return 'Colaborador';
      default:
        return role;
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500">Erro ao carregar usuários. Tente novamente.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <UsersIcon className="h-8 w-8" />
          Gestão de Usuários
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          {canManageUsers && (
            <>
              <Shield size={16} className="text-amber-500" /> 
              <span>Você pode gerenciar usuários da empresa</span>
            </>
          )}
          {!canManageUsers && "Visualize os membros da sua equipe"}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <span>Total: {total} usuários</span>
          {filters.search && <span>• Filtrados por: "{filters.search}"</span>}
          {filters.role && <span>• Role: {getRoleDisplayName(filters.role)}</span>}
        </div>
      </div>

      {/* Filtros e Ações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro Role */}
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'ALL')}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as roles</SelectItem>
                <SelectItem value="OWNER">Proprietário</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="MANAGER">Gerente</SelectItem>
                <SelectItem value="COLLABORATOR">Colaborador</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Status */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE')}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os status</SelectItem>
                <SelectItem value="ACTIVE">Ativos</SelectItem>
                <SelectItem value="INACTIVE">Inativos</SelectItem>
              </SelectContent>
            </Select>

            {/* Botões */}
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button onClick={handleClearFilters} variant="outline">
                Limpar
              </Button>
              {canManageUsers && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Crie uma nova conta para um membro da equipe.
                      </DialogDescription>
                    </DialogHeader>
                    <AddUserForm onSuccess={() => setShowAddDialog(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
        </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
          <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe ({total})</CardTitle>
          <CardDescription>
            Gerencie os usuários da sua empresa e suas permissões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading text="Carregando usuários..." />
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
              {canManageUsers && (
                <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar primeiro usuário
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Tabela de usuários */}
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {user.is_owner && (
                            <Shield className="h-4 w-4 text-purple-500" />
                          )}
                          {!user.is_active && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                      {canManageUsers && user.id !== currentUser?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {(!user.is_owner || isOwner) && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    Página {currentPage + 1} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
        </div>
      </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
