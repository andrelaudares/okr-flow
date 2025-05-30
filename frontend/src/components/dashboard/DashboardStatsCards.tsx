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
  Clock,
  Star,
  Settings
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
import { useGlobalCycles } from '@/hooks/use-global-cycles';
import { usePermissions } from '@/hooks/use-auth';
import ProgressCard from './ProgressCard';
import ObjectivesCountCard from './ObjectivesCountCard';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import type { DashboardStats } from '@/types/dashboard';
import type { GlobalCycleWithStatus } from '@/types/global-cycles';
import { getCycleIcon, formatCyclePeriod, getCycleTypeLabel } from '@/types/global-cycles';

interface DashboardStatsCardsProps {
  className?: string;
}

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ className }) => {
  const { 
    globalCycles,
    userPreference,
    currentCycle,
    availableYears,
    isLoading: isLoadingCycles,
    isLoadingPreference,
    isUpdatingPreference,
    error: cycleError,
    updateUserPreference,
    fetchGlobalCycles
  } = useGlobalCycles();

  const activeCycle = userPreference || currentCycle;
  
  const {
    stats,
    progress,
    objectivesCount,
    isLoading,
    isLoadingStats,
    isLoadingProgress,
    isLoadingCount,
    error,
    refetchProgress
  } = useDashboardStats({
    cycleCode: activeCycle?.code,
    cycleYear: activeCycle?.year,
    autoRefresh: true
  });

  const { isOwner, isAdmin } = usePermissions();

  const [showCycleDialog, setShowCycleDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const handleChangeCycle = async (cycle: GlobalCycleWithStatus) => {
    try {
      await updateUserPreference({
        global_cycle_code: cycle.code,
        year: cycle.year
      });
      setShowCycleDialog(false);
      
      // Refazer o fetch do progresso com o novo ciclo
      // O useEffect do useDashboardStats vai detectar a mudança automaticamente
      toast.success(`Ciclo alterado para ${cycle.name}`);
    } catch (error) {
      console.error('Erro ao definir preferência:', error);
      toast.error('Erro ao alterar ciclo');
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    fetchGlobalCycles(year);
  };

  const getStatusBadge = (cycle: GlobalCycleWithStatus) => {
    if (cycle.is_current) {
      return <Badge className="bg-green-100 text-green-800 text-xs">🔥 Atual</Badge>;
    } else if (cycle.is_future) {
      return <Badge className="bg-blue-100 text-blue-800 text-xs">📅 Futuro</Badge>;
    } else if (cycle.is_past) {
      return <Badge className="bg-gray-100 text-gray-800 text-xs">✅ Passado</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">-</Badge>;
  };

  // Se há erro, apenas log no console mas continua funcionando
  if (error || cycleError) {
    console.warn('Erro no dashboard (não crítico):', error || cycleError);
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
            ) : (
              <>
                <div className="text-2xl font-bold text-nobug-600">
                  {stats?.company_name || 'Minha Empresa'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.active_users || 0} usuários ativos
                </p>
              </>
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
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_objectives || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.total_key_results || 0} metas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Progresso dos Objetivos - Antigo Ciclo Ativo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso dos Objetivos</CardTitle>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-muted-foreground" /> 
              {(isOwner || isAdmin) && globalCycles.length > 0 && (
                <Dialog open={showCycleDialog} onOpenChange={setShowCycleDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      title="Trocar ciclo ativo"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Escolher Ciclo</DialogTitle>
                      <DialogDescription>
                        Selecione seu ciclo preferido para organizar seus OKRs
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Seletor de Ano */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-600">Ano:</span>
                      <select
                        value={selectedYear}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {globalCycles
                        .filter(cycle => cycle.year === selectedYear)
                        .map((cycle) => (
                        <div
                          key={`${cycle.code}-${cycle.year}`}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            cycle.code === activeCycle?.code && cycle.year === activeCycle?.year
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleChangeCycle(cycle)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCycleIcon(cycle.code)}</span>
                                <span className="font-medium">{cycle.name}</span>
                                {getStatusBadge(cycle)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatCyclePeriod(cycle)} • {getCycleTypeLabel(cycle.type)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {cycle.progress_percentage?.toFixed(1)}% • {cycle.days_remaining} dias restantes
                              </div>
                            </div>
                            {cycle.code === activeCycle?.code && cycle.year === activeCycle?.year && (
                              <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
                                <Star className="h-3 w-3" />
                                Escolhido
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
            {isLoadingCycles ? (
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (activeCycle || progress) ? (
              <>
                {/* Nome do ciclo continua, mas o foco é no progresso dos objetivos */}
                <div className="text-2xl font-bold truncate" title={activeCycle?.name || 'Progresso Geral'}>
                  {activeCycle?.name || 'Progresso Geral'}
                </div>
                
                {/* Linha com progresso dos objetivos */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Média de {progress?.current_progress?.toFixed(1) || '0.0'}%
                  </span>
                  {/* Removemos os dias restantes, pois o foco é nos objetivos */}
                </div>
                
                {/* Barra de progresso dos objetivos */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-nobug-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress?.current_progress || 0, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">Progresso Geral</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Média de 0.0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-nobug-500 h-2 rounded-full w-0" />
                </div>
              </>
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
        {progress ? (
          <ProgressCard data={progress} isLoading={isLoadingProgress} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Progresso dos Objetivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Carregando dados de progresso...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de contadores de objetivos */}
        {objectivesCount ? (
          <ObjectivesCountCard data={objectivesCount} isLoading={isLoadingCount} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Objetivos por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Carregando contadores...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardStatsCards; 