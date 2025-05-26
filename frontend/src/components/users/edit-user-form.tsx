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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/use-users';
import { usePermissions } from '@/hooks/use-auth';
import type { User, UserRole } from '@/types/auth';

// Schema de validação
const editUserSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  role: z.enum(['ADMIN', 'MANAGER', 'COLLABORATOR'] as const),
  is_active: z.boolean(),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, "Senha deve ter pelo menos 6 caracteres"),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  user: User;
  onSuccess: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { updateUser, isUpdating } = useUsers();
  const { isOwner, isAdmin } = usePermissions();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER' | 'COLLABORATOR',
      is_active: user.is_active,
      password: '',
    },
  });

  const watchedRole = watch('role');
  const watchedIsActive = watch('is_active');

  const onSubmit = async (data: EditUserFormData) => {
    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
      };

      // Só incluir senha se foi preenchida
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }

      await updateUser(user.id, updateData);
      toast.success(`Usuário ${data.name} atualizado com sucesso!`);
      onSuccess();
    } catch (error: any) {
      console.error('Update user error:', error);
      // O erro já é tratado pelos interceptors da API
    }
  };

  const isFormLoading = isUpdating || isSubmitting;

  // Verificar se pode editar este usuário
  const canEditRole = isOwner || (isAdmin && user.role !== 'OWNER');
  const canEditStatus = isOwner || (isAdmin && user.role !== 'OWNER');

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

      {canEditRole && (
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
        </div>
      )}

      {canEditStatus && (
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={watchedIsActive}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
          <Label htmlFor="is_active">
            Usuário ativo
          </Label>
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Alterar senha (opcional)</h3>
        
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Deixe em branco para manter a senha atual"
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
            Mínimo de 6 caracteres. Deixe em branco para não alterar.
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isFormLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isFormLoading}
        >
          {isFormLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm; 