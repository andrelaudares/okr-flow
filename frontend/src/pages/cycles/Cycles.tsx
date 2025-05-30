import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock,
  Target,
  Check,
  Star
} from 'lucide-react';
import { useGlobalCycles } from '@/hooks/use-global-cycles';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import type { GlobalCycleWithStatus } from '@/types/global-cycles';
import { getCycleIcon, formatCyclePeriod } from '@/types/global-cycles';

const Cycles = () => {
  const { 
    globalCycles,
    userPreference,
    currentCycle,
    availableYears,
    isLoading,
    isLoadingPreference,
    isUpdatingPreference,
    error,
    fetchGlobalCycles,
    updateUserPreference
  } = useGlobalCycles();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    fetchGlobalCycles(year);
  };

  const handleSetPreference = async (cycle: GlobalCycleWithStatus) => {
    try {
      await updateUserPreference({
        global_cycle_code: cycle.code,
        year: cycle.year
      });
    } catch (error) {
      console.error('Erro ao definir preferência:', error);
    }
  };

  const getStatusBadge = (cycle: GlobalCycleWithStatus) => {
    if (cycle.is_current) {
      return <Badge className="bg-green-100 text-green-800">🔥 Atual</Badge>;
    } else if (cycle.is_future) {
      return <Badge className="bg-blue-100 text-blue-800">📅 Futuro</Badge>;
    } else if (cycle.is_past) {
      return <Badge className="bg-gray-100 text-gray-800">✅ Passado</Badge>;
    }
    return <Badge variant="secondary">-</Badge>;
  };

  const isUserPreference = (cycle: GlobalCycleWithStatus): boolean => {
    return userPreference?.id === cycle.id;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500">Erro ao carregar ciclos: {error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Ciclos Globais
            </h1>
            <p className="text-gray-600 mt-2">
              Escolha seu ciclo preferido para organizar seus OKRs
            </p>
          </div>
          
          {/* Seletor de Ano */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Ciclo da Preferência do Usuário */}
      {userPreference && (
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Star className="h-5 w-5" />
              Seu Ciclo Escolhido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ciclo</p>
                <p className="font-semibold flex items-center gap-2">
                  {getCycleIcon(userPreference.code)} {userPreference.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Período</p>
                <p className="font-medium">
                  {formatCyclePeriod(userPreference)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progresso</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${userPreference.progress_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{userPreference.progress_percentage || 0}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {getStatusBadge(userPreference)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ciclos Globais */}
      <div className="grid gap-6">
        
        {/* Semestres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Semestres {selectedYear}
            </CardTitle>
            <CardDescription>
              Ciclos de 6 meses para visão estratégica de longo prazo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading text="Carregando semestres..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalCycles
                  .filter(cycle => cycle.type === 'SEMESTRE')
                  .map((cycle) => (
                    <CycleCard 
                      key={cycle.id} 
                      cycle={cycle} 
                      isPreference={isUserPreference(cycle)}
                      onSetPreference={handleSetPreference}
                      isUpdating={isUpdatingPreference}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trimestres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Trimestres {selectedYear}
            </CardTitle>
            <CardDescription>
              Ciclos de 3 meses para acompanhamento equilibrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading text="Carregando trimestres..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {globalCycles
                  .filter(cycle => cycle.type === 'TRIMESTRE')
                  .map((cycle) => (
                    <CycleCard 
                      key={cycle.id} 
                      cycle={cycle} 
                      isPreference={isUserPreference(cycle)}
                      onSetPreference={handleSetPreference}
                      isUpdating={isUpdatingPreference}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quadrimestres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗓️ Quadrimestres {selectedYear}
            </CardTitle>
            <CardDescription>
              Ciclos de 4 meses para execução focada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading text="Carregando quadrimestres..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {globalCycles
                  .filter(cycle => cycle.type === 'QUADRIMESTRE')
                  .map((cycle) => (
                    <CycleCard 
                      key={cycle.id} 
                      cycle={cycle} 
                      isPreference={isUserPreference(cycle)}
                      onSetPreference={handleSetPreference}
                      isUpdating={isUpdatingPreference}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

// Componente para Card de Ciclo Individual
interface CycleCardProps {
  cycle: GlobalCycleWithStatus;
  isPreference: boolean;
  onSetPreference: (cycle: GlobalCycleWithStatus) => void;
  isUpdating: boolean;
}

const CycleCard: React.FC<CycleCardProps> = ({ 
  cycle, 
  isPreference, 
  onSetPreference, 
  isUpdating 
}) => {
  const getStatusBadge = () => {
    if (cycle.is_current) {
      return <Badge className="bg-green-100 text-green-800">🔥 Atual</Badge>;
    } else if (cycle.is_future) {
      return <Badge className="bg-blue-100 text-blue-800">📅 Futuro</Badge>;
    } else if (cycle.is_past) {
      return <Badge className="bg-gray-100 text-gray-800">✅ Passado</Badge>;
    }
    return <Badge variant="secondary">-</Badge>;
  };

  return (
    <div className={`
      border rounded-lg p-4 transition-all duration-200 hover:shadow-md
      ${isPreference 
        ? 'border-blue-500 bg-blue-50 shadow-md' 
        : 'border-gray-200 bg-white hover:border-gray-300'
      }
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCycleIcon(cycle.code)}</span>
          <div>
            <h3 className="font-semibold text-sm">{cycle.display_name}</h3>
            <p className="text-xs text-gray-500">{cycle.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {isPreference && (
            <Badge variant="default" className="bg-blue-600">
              <Star className="h-3 w-3 mr-1" />
              Escolhido
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatCyclePeriod(cycle)}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          {cycle.days_total} dias total
        </div>

        {/* Progresso */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Progresso</span>
            <span className="text-xs font-medium">{cycle.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                cycle.is_current ? 'bg-green-500' : 
                cycle.is_future ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{ width: `${cycle.progress_percentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {!isPreference && (
        <Button
          onClick={() => onSetPreference(cycle)}
          disabled={isUpdating}
          size="sm"
          variant="outline"
          className="w-full text-xs"
        >
          {isUpdating ? 'Definindo...' : 'Escolher este ciclo'}
        </Button>
      )}
      
      {isPreference && (
        <div className="flex items-center justify-center py-2 text-xs text-blue-600 font-medium">
          <Check className="h-3 w-3 mr-1" />
          Este é seu ciclo escolhido
        </div>
      )}
    </div>
  );
};

export default Cycles; 