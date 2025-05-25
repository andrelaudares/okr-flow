
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, UserCog, Shield, UserCheck, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types/user';
import EditUserDialog from './edit-user-dialog';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserListProps {
  users: User[];
  onDelete: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onDelete }) => {
  const { updateUser, toggleUserStatus, isAdmin } = useUsers();
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const isCurrentUserAdmin = currentUser ? isAdmin(currentUser.email) : false;

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleSave = (userId: string, data: { name: string; email: string; password?: string }) => {
    updateUser(userId, data);
    toast.success('Usuário atualizado com sucesso');
  };

  const handleToggleStatus = (userId: string, email: string) => {
    // Prevent admin from deactivating themselves
    if (email === 'dinei@nobug.com.br') {
      toast.error('Não é possível desativar o usuário administrador');
      return;
    }
    
    toggleUserStatus(userId);
    toast.success('Status do usuário atualizado');
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            {isCurrentUserAdmin && <TableHead>Status</TableHead>}
            <TableHead className="w-[140px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isCurrentUserAdmin ? 4 : 3} className="text-center py-6 text-gray-500">
                Nenhum usuário cadastrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className={!user.active ? "opacity-60" : ""}>
                <TableCell className="font-medium flex items-center gap-2">
                  {user.email === 'dinei@nobug.com.br' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Shield size={16} className="text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Administrador
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                {isCurrentUserAdmin && (
                  <TableCell>
                    <Switch 
                      checked={user.active !== false}
                      onCheckedChange={() => handleToggleStatus(user.id, user.email)}
                      disabled={user.email === 'dinei@nobug.com.br'}
                    />
                  </TableCell>
                )}
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 h-8 w-8 p-0"
                    title="Editar"
                    onClick={() => handleEditClick(user)}
                  >
                    <UserCog className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  {isCurrentUserAdmin && user.email !== 'dinei@nobug.com.br' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={user.active !== false ? "text-amber-600 h-8 w-8 p-0" : "text-green-600 h-8 w-8 p-0"}
                            onClick={() => handleToggleStatus(user.id, user.email)}
                          >
                            {user.active !== false ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {user.active !== false ? "Desativar usuário" : "Ativar usuário"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 h-8 w-8 p-0"
                        disabled={user.email === 'dinei@nobug.com.br' && isCurrentUserAdmin}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o usuário "{user.name}"? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selectedUser}
        onSave={handleSave}
      />
    </>
  );
};

export default UserList;
