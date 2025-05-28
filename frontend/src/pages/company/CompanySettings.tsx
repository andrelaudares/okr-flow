import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Save, Users, Calendar } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { usePermissions } from '@/hooks/use-auth';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';

const CompanySettings = () => {
  const { company, isLoading, isError, isUpdating, updateCompany } = useCompany();
  const { isOwner, isAdmin } = usePermissions();
  const [companyName, setCompanyName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Atualizar estado quando dados carregarem
  React.useEffect(() => {
    if (company) {
      setCompanyName(company.name);
    }
  }, [company]);

  // Verificar se há mudanças
  React.useEffect(() => {
    if (company) {
      setHasChanges(companyName !== company.name);
    }
  }, [companyName, company]);

  const handleSave = async () => {
    if (!company || !hasChanges) return;

    try {
      await updateCompany({ name: companyName });
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleReset = () => {
    if (company) {
      setCompanyName(company.name);
      setHasChanges(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Carregando dados da empresa..." />
      </div>
    );
  }

  const canEdit = isOwner || isAdmin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Configurações da Empresa
        </h1>
        <p className="text-gray-600 mt-2">
          {canEdit 
            ? "Gerencie as informações da sua empresa" 
            : "Visualize as informações da empresa"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações Básicas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Digite o nome da empresa"
                />
              </div>

              {canEdit && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={!hasChanges || isUpdating}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  {hasChanges && (
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      disabled={isUpdating}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de usuários</span>
                  <span className="font-semibold">{company?.users_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Usuários ativos</span>
                  <span className="font-semibold text-green-600">
                    {company?.active_users_count || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Criada em</span>
                  <p className="font-medium">
                    {company?.created_at 
                      ? new Date(company.created_at).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">ID da Empresa</span>
                  <p className="font-mono text-xs text-gray-500 break-all">
                    {company?.id || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings; 