import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Calendar, 
  Save, 
  Loader2,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth, usePermissions } from '@/hooks/use-auth';
// import { useCompany } from '@/hooks/useCompany'; // TODO: Create this hook
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema de validação
const companySchema = z.object({
  name: z
    .string()
    .min(1, "Nome da empresa é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type CompanyFormData = z.infer<typeof companySchema>;

const CompanySettings = () => {
  const { user } = useAuth();
  const { canManageCompany, isOwner } = usePermissions();
  // TODO: Implement useCompany hook
  const company = null;
  const isLoading = false;
  const isError = false;
  const updateCompany = async (data: any) => {
    console.log('updateCompany called with:', data);
    toast.success('Feature will be implemented with backend integration');
  };
  const isUpdating = false;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
    },
  });

  // Atualizar form quando dados carregarem
  React.useEffect(() => {
    if (company) {
      reset({ name: company.name });
    }
  }, [company, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await updateCompany({ name: data.name });
      toast.success('Configurações da empresa atualizadas com sucesso!');
    } catch (error: any) {
      console.error('Update company error:', error);
      // O erro já é tratado pelos interceptors da API
    }
  };

  const isFormLoading = isUpdating || isSubmitting;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Carregando configurações da empresa..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500">Erro ao carregar dados da empresa. Tente novamente.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canManageCompany) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar as configurações da empresa.
            Apenas proprietários e administradores podem gerenciar essas configurações.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Configurações da Empresa
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <Shield size={16} className="text-amber-500" />
          <span>Gerencie as informações e configurações da sua empresa</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações da Empresa */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Atualize os dados principais da sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da empresa *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Minha Empresa Ltda"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
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
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar alterações
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => reset()}
                    disabled={isFormLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas da Empresa */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Informações gerais sobre sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Total de usuários</span>
                </div>
                <Badge variant="secondary">
                  {company?.users_count || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Usuários ativos</span>
                </div>
                <Badge variant="secondary">
                  {company?.active_users_count || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Criada em</span>
                </div>
                <Badge variant="secondary">
                  {company?.created_at ? 
                    new Date(company.created_at).toLocaleDateString('pt-BR') 
                    : '--'
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Proprietário */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Proprietário</CardTitle>
                <CardDescription>
                  Informações sobre o proprietário da empresa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge className="bg-purple-100 text-purple-800">
                    Proprietário
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySettings; 