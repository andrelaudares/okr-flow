import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/use-users';
import { usePermissions } from '@/hooks/use-auth';
import type { UserRole } from '@/types/auth';

// Schema de validação
const addUserSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número"),
  role: z.enum(['ADMIN', 'MANAGER', 'COLLABORATOR'] as const),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserFormProps {
  onSuccess?: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { createUser, isCreating } = useUsers();
  const { isOwner, isAdmin } = usePermissions();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'COLLABORATOR',
    },
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: AddUserFormData) => {
    try {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        username: data.email, // Usar email como username
        role: data.role,
      });
      
      toast.success(`Usuário ${data.name} criado com sucesso!`);
      reset(); // Limpar formulário
      onSuccess?.(); // Fechar dialog se houver
    } catch (error: any) {
      console.error('Create user error:', error);
      // O erro já é tratado pelos interceptors da API
    }
  };

  const isFormLoading = isCreating || isSubmitting;

  // Verificar se pode criar usuários
  const canCreateUsers = isOwner || isAdmin;

  if (!canCreateUsers) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Você não tem permissão para criar usuários.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
        <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
          type="text"
          placeholder="João da Silva"
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
          </div>

          <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
          placeholder="nome@exemplo.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função *</Label>
        <Select
          value={watchedRole}
          onValueChange={(value) => setValue('role', value as 'ADMIN' | 'MANAGER' | 'COLLABORATOR')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="MANAGER">Gerente</SelectItem>
            <SelectItem value="COLLABORATOR">Colaborador</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Apenas owners podem criar outros owners.
        </p>
          </div>

          <div className="space-y-2">
        <Label htmlFor="password">Senha *</Label>
        <div className="relative">
            <Input
              id="password"
            type={showPassword ? "text" : "password"}
              placeholder="••••••••"
            {...register("password")}
            className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
        <p className="text-xs text-gray-500">
          A senha deve conter pelo menos 6 caracteres, incluindo 1 letra minúscula, 1 maiúscula e 1 número.
        </p>
          </div>

      <div className="flex gap-2 pt-4">
        {onSuccess && (
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isFormLoading}
          >
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isFormLoading}
          className={onSuccess ? "" : "w-full"}
        >
          {isFormLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar usuário"
          )}
        </Button>
      </div>
        </form>
  );
};

export default AddUserForm;
