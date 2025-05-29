import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Target, 
  Activity,
  Calendar,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useCycles } from '@/hooks/use-cycles';
import { usePermissions } from '@/hooks/use-auth';
import ProgressCard from './ProgressCard';
import ObjectivesCountCard from './ObjectivesCountCard';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import type { DashboardStats } from '@/types/dashboard';

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
    activateCycle 
  } = useCycles();

  const { isOwner, isAdmin } = usePermissions();
  const canManageCycles = isOwner || isAdmin;

  const [isChangingCycle, setIsChangingCycle] = useState(false);

  const handleChangeCycle = async (cycleId: string) => {
    if (!canManageCycles) {
      toast.error('Você não tem permissão para alterar o ciclo ativo');
      return;
    }

    setIsChangingCycle(true);
    try {
      await activateCycle(cycleId);
      toast.success('Ciclo ativo alterado com sucesso!');
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

        {/* Ciclo Ativo com Seletor */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ciclo Ativo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : activeCycle ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold truncate" title={activeCycle.name}>
                      {activeCycle.name}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activeCycle.progress_percentage.toFixed(1)}% do tempo decorrido
                    </p>
                  </div>
                  
                  {canManageCycles && getAvailableCycles().length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-6 w-6 p-0"
                          disabled={isChangingCycle || isActivating}
                        >
                          {isChangingCycle || isActivating ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                          Trocar ciclo ativo
                        </div>
                        <DropdownMenuSeparator />
                        {getAvailableCycles().map((cycle) => (
                          <DropdownMenuItem
                            key={cycle.id}
                            onClick={() => handleChangeCycle(cycle.id)}
                            disabled={cycle.id === activeCycle.id || isChangingCycle}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{cycle.name}</span>
                              <span className="text-xs text-gray-500">
                                {cycle.progress_percentage.toFixed(1)}% • {cycle.days_remaining} dias restantes
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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