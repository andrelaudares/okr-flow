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
import api from '@/lib/api';
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { updateUser, isUpdating, refetch } = useUsers();
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

      // Atualizar dados básicos do usuário
      await updateUser(user.id, updateData);

      // Se senha foi preenchida, alterar senha separadamente
      if (data.password && data.password.trim()) {
        setIsChangingPassword(true);
        try {
          const response = await api.post(`/api/users/${user.id}/change-password`, {
            new_password: data.password
          });
          
          // Verificar diferentes tipos de resposta
          if (response.data.manual_instruction) {
            // Mostrar instruções detalhadas com opção de copiar
            const message = response.data.message;
            const newPassword = response.data.new_password;
            const userName = response.data.user_name;
            
            // Mostrar toast de sucesso primeiro
            toast.success(`Senha definida para ${userName}!`);
            
            // Depois mostrar as instruções com opção de copiar
            const confirmMessage = `${message}\n\nDeseja copiar a senha "${newPassword}" para a área de transferência?`;
            
            if (window.confirm(confirmMessage)) {
              // Copiar senha para clipboard
              try {
                await navigator.clipboard.writeText(newPassword);
                toast.success("📋 Senha copiada! Cole onde precisar.");
              } catch (err) {
                // Fallback para seleção manual
                const textArea = document.createElement('textarea');
                textArea.value = newPassword;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast.success("📋 Senha copiada! Cole onde precisar.");
              }
            } else {
              toast.warning("⚠️ Lembre-se de anotar a senha antes de sair desta tela!");
            }
            
          } else {
            // Sucesso direto (caso o Supabase permita)
            toast.success("Senha alterada com sucesso!");
          }
          
        } catch (passwordError: any) {
          console.error('Password change error:', passwordError);
          toast.error(passwordError.response?.data?.detail || 'Erro ao alterar senha');
        }
      }

      toast.success(`Usuário ${data.name} atualizado com sucesso!`);
      await refetch(); // Atualizar lista
      onSuccess();
    } catch (error: any) {
      console.error('Update user error:', error);
      toast.error(error.response?.data?.detail || 'Erro ao atualizar usuário');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isFormLoading = isUpdating || isSubmitting || isChangingPassword;

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