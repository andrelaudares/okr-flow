import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Target, 
  Activity,
  Calendar,
  RefreshCw,
  ArrowUpDown,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useCycles } from '@/hooks/use-cycles';
import { usePermissions } from '@/hooks/use-auth';
import ProgressCard from './ProgressCard';
import ObjectivesCountCard from './ObjectivesCountCard';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import type { DashboardStats } from '@/types/dashboard';
import type { Cycle } from '@/types/cycles';

interface DashboardStatsCardsProps {
  className?: string;
}

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ className }) => {
  const {
    stats,
    progress,
    objectivesCount,
    isLoading,
    isLoadingStats,
    isLoadingProgress,
    isLoadingCount,
    error
  } = useDashboardStats();

  const { 
    cycles, 
    activeCycle, 
    isActivating, 
    activateCycle,
    isLoadingActive 
  } = useCycles();

  const { isOwner, isAdmin } = usePermissions();
  const canManageCycles = isOwner || isAdmin;

  const [isChangingCycle, setIsChangingCycle] = useState(false);
  const [showCycleDialog, setShowCycleDialog] = useState(false);

  const handleChangeCycle = async (cycle: Cycle) => {
    if (!canManageCycles) {
      toast.error('Você não tem permissão para alterar o ciclo ativo');
      return;
    }

    if (cycle.id === activeCycle?.id) {
      setShowCycleDialog(false);
      return;
    }

    setIsChangingCycle(true);
    try {
      await activateCycle(cycle.id);
      toast.success(`Ciclo "${cycle.name}" ativado com sucesso!`);
      setShowCycleDialog(false);
    } catch (error) {
      console.error('Erro ao alterar ciclo:', error);
      toast.error('Erro ao alterar ciclo ativo');
    } finally {
      setIsChangingCycle(false);
    }
  };

  const getAvailableCycles = () => {
    return cycles.filter(cycle => 
      cycle.status === 'PLANNED' || cycle.status === 'ACTIVE'
    );
  };

  const getStatusBadge = (cycle: Cycle) => {
    switch (cycle.status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 text-xs">Ativo</Badge>;
      case 'PLANNED':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Planejado</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Concluído</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800 text-xs">Expirado</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{cycle.status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-800">
          <Target className="h-5 w-5" />
          <span className="font-medium">Erro ao carregar dados do dashboard</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Cards principais de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Empresa */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresa</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : stats ? (
              <>
                <div className="text-2xl font-bold text-nobug-600">
                  {stats.company_name}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.active_users} usuários ativos
                </p>
              </>
            ) : (
              <div className="text-sm text-gray-500">Carregando...</div>
            )}
          </CardContent>
        </Card>

        {/* Objetivos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objetivos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : stats ? (
              <>
                <div className="text-2xl font-bold">{stats.total_objectives}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total_key_results} key results
                </p>
              </>
            ) : (
              <div className="text-sm text-gray-500">Carregando...</div>
            )}
          </CardContent>
        </Card>

        {/* Ciclo Ativo - Layout Melhorado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ciclo Ativo</CardTitle>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {canManageCycles && getAvailableCycles().length > 1 && (
                <Dialog open={showCycleDialog} onOpenChange={setShowCycleDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      disabled={isChangingCycle || isActivating}
                      title="Trocar ciclo ativo"
                    >
                      {isChangingCycle || isActivating ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Trocar Ciclo Ativo</DialogTitle>
                      <DialogDescription>
                        Selecione qual ciclo você deseja ativar. O ciclo atual será desativado.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                      {getAvailableCycles().map((cycle) => (
                        <div
                          key={cycle.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            cycle.id === activeCycle?.id 
                              ? 'border-nobug-500 bg-nobug-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleChangeCycle(cycle)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{cycle.name}</span>
                                {getStatusBadge(cycle)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {new Date(cycle.start_date).toLocaleDateString('pt-BR')} - {' '}
                                {new Date(cycle.end_date).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {cycle.progress_percentage.toFixed(1)}% • {cycle.days_remaining} dias restantes
                              </div>
                            </div>
                            {cycle.id === activeCycle?.id && (
                              <div className="text-nobug-600 font-medium text-sm">
                                Atual
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingActive ? (
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : activeCycle ? (
              <>
                {/* Nome do ciclo */}
                <div className="text-2xl font-bold truncate" title={activeCycle.name}>
                  {activeCycle.name}
                </div>
                
                {/* Linha com progresso e dias restantes */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {activeCycle.progress_percentage.toFixed(1)}% decorrido
                  </span>
                  <span className="font-medium text-nobug-600">
                    {activeCycle.days_remaining} dias restantes
                  </span>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-nobug-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(activeCycle.progress_percentage, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Nenhum ciclo ativo</div>
            )}
          </CardContent>
        </Card>

        {/* Data Atual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards avançados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de progresso */}
        {progress && (
          <ProgressCard data={progress} isLoading={isLoadingProgress} />
        )}

        {/* Card de contadores de objetivos */}
        {objectivesCount && (
          <ObjectivesCountCard data={objectivesCount} isLoading={isLoadingCount} />
        )}
      </div>
    </div>
  );
};

export default DashboardStatsCards; 