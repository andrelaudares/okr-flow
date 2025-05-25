
import React from 'react';
import { Card } from '@/components/ui/card';
import AddUserForm from '@/components/users/add-user-form';
import UserList from '@/components/users/user-list';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const Users = () => {
  const { users, deleteUser, isAdmin } = useUsers();
  const { user: currentUser } = useAuth();
  const isCurrentUserAdmin = currentUser ? isAdmin(currentUser.email) : false;
  
  // Filter to only show active users for regular users, admins see all
  const displayedUsers = isCurrentUserAdmin 
    ? users 
    : users.filter(user => user.active !== false);

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    toast.success('Usuário removido com sucesso');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
        <p className="text-gray-500 flex items-center gap-2">
          {isCurrentUserAdmin && (
            <>
              <Shield size={16} className="text-amber-500" /> 
              <span>Modo Administrador - Você pode ativar ou desativar usuários</span>
            </>
          )}
          {!isCurrentUserAdmin && "Adicione e gerencie usuários para atribuição de OKRs"}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <AddUserForm />
        </div>
        <div className="md:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Membros da Equipe</h2>
              <UserList users={displayedUsers} onDelete={handleDeleteUser} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Users;
