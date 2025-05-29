import React, { useState } from "react";
import { 
  CalendarDays, 
  CalendarRange, 
  CalendarPlus, 
  Target, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Settings,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useTimeCards } from "@/hooks/use-time-cards";
import { Objective } from "@/types/okr";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";

interface DashboardInfoCardsProps {
  objectives: Objective[];
}

const DashboardInfoCards: React.FC<DashboardInfoCardsProps> = ({ objectives }) => {
  const { 
    timeCards, 
    selectedCards, 
    activeCycle,
    allCycles,
    isLoading, 
    isUpdatingPreferences,
    updatePreferences,
    getAllAvailableCards,
    getVisibleCards,
    canAddMoreCycles,
    getSelectedCycles
  } = useTimeCards();
  
  const [showSettings, setShowSettings] = useState(false);
  const [tempSelectedCards, setTempSelectedCards] = useState<string[]>([]);

  // Abrir configurações
  const handleOpenSettings = () => {
    setTempSelectedCards([...selectedCards]);
    setShowSettings(true);
  };

  // Salvar preferências
  const handleSavePreferences = async () => {
    try {
      // Filtrar apenas cards temporais válidos (não ciclos) para o backend
      const validTimeCards = tempSelectedCards.filter(cardId => !cardId.startsWith('CYCLE_'));
      
      await updatePreferences({ selected_cards: validTimeCards });
      setShowSettings(false);
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  // Toggle card selection com validação de limite
  const toggleCard = (cardId: string) => {
    const isCurrentlySelected = tempSelectedCards.includes(cardId);
    const isCycleCard = cardId.startsWith('CYCLE_');
    
    if (isCurrentlySelected) {
      // Remover card
      setTempSelectedCards(prev => prev.filter(id => id !== cardId));
    } else {
      // Adicionar card
      if (isCycleCard) {
        const currentCycleCards = tempSelectedCards.filter(id => id.startsWith('CYCLE_'));
        if (currentCycleCards.length >= 2) {
          toast.error('Você pode selecionar no máximo 2 ciclos');
          return;
        }
      }
      setTempSelectedCards(prev => [...prev, cardId]);
    }
  };

  // Calcular evolução geral dos OKRs
  const progressoGeral = objectives.length > 0
    ? Math.round(objectives.reduce((acc, obj) => acc + obj.progress, 0) / objectives.length)
    : 0;
    
  // Calcular objetivos concluídos
  const objetivosConcluidos = objectives.filter(obj => obj.progress === 100).length;

  // Calcular % previsto com base no ciclo ativo ou data atual
  let percentagePrevisto = 0;
  if (activeCycle) {
    percentagePrevisto = activeCycle.progress_percentage;
  } else {
    // Fallback para cálculo baseado na data atual
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const totalDaysInYear = 365 + (currentDate.getFullYear() % 4 === 0 ? 1 : 0);
    const daysPassed = Math.ceil((currentDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24));
    percentagePrevisto = Math.round((daysPassed / totalDaysInYear) * 100);
  }
  
  // Determinar status do progresso
  const difference = progressoGeral - percentagePrevisto;
  let statusInfo;
  if (difference >= 10) {
    statusInfo = { 
      label: "Adiantado", 
      color: "text-green-600", 
      bgColor: "bg-green-50", 
      icon: <TrendingUp className="w-6 h-6 text-green-600" /> 
    };
  } else if (difference >= -5) {
    statusInfo = { 
      label: "Em dia", 
      color: "text-blue-600", 
      bgColor: "bg-blue-50", 
      icon: <CheckCircle className="w-6 h-6 text-blue-600" /> 
    };
  } else {
    statusInfo = { 
      label: "Atrasado", 
      color: "text-amber-600", 
      bgColor: "bg-amber-50", 
      icon: <TrendingDown className="w-6 h-6 text-amber-600" /> 
    };
  }

  // Obter cards visíveis e disponíveis
  const visibleCards = getVisibleCards();
  const availableCards = getAllAvailableCards();
  const selectedCycleCards = getSelectedCycles();

  if (isLoading) {
    return (
      <div className="mb-8">
        <Loading text="Carregando cards temporais..." />
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header com configurações */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Cards Temporais</h2>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleOpenSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Cards
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar Cards Temporais</DialogTitle>
              <DialogDescription>
                Escolha quais cards temporais deseja visualizar no dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Cards Temporais */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Cards Temporais</h4>
                {availableCards
                  .filter(card => card.category === 'temporal')
                  .map((card) => (
                    <div key={card.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={card.id}
                        checked={tempSelectedCards.includes(card.id)}
                        onCheckedChange={() => toggleCard(card.id)}
                      />
                      <label htmlFor={card.id} className="text-sm">
                        <div className="font-medium">{card.title}</div>
                        <div className="text-xs text-gray-500">{card.description}</div>
                      </label>
                    </div>
                  ))}
              </div>

              {/* Cards de Ciclos */}
              {availableCards.some(card => card.category === 'cycle') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-700">Ciclos</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <AlertCircle className="h-3 w-3" />
                      <span>{selectedCycleCards.length}/2 selecionados</span>
                    </div>
                  </div>
                  {availableCards
                    .filter(card => card.category === 'cycle')
                    .map((card) => {
                      const isSelected = tempSelectedCards.includes(card.id);
                      const canSelect = isSelected || tempSelectedCards.filter(id => id.startsWith('CYCLE_')).length < 2;
                      
                      return (
                        <div key={card.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={card.id}
                            checked={isSelected}
                            onCheckedChange={() => toggleCard(card.id)}
                            disabled={!canSelect}
                          />
                          <label 
                            htmlFor={card.id} 
                            className={`text-sm ${!canSelect ? 'opacity-50' : ''}`}
                          >
                            <div className="font-medium">{card.title}</div>
                            <div className="text-xs text-gray-500">{card.description}</div>
                          </label>
                        </div>
                      );
                    })}
                  {tempSelectedCards.filter(id => id.startsWith('CYCLE_')).length >= 2 && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2">
                      Máximo de 2 ciclos selecionados. Desmarque um para selecionar outro.
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSavePreferences} disabled={isUpdatingPreferences}>
                {isUpdatingPreferences ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Cards Temporais e de Ciclos da API */}
        {visibleCards.map((card) => (
          <div 
            key={`${card.type}-${card.category}`}
            className={`flex items-center gap-3 rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${
              card.category === 'cycle' 
                ? 'bg-gradient-to-br from-purple-50 to-white border-purple-100' 
                : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'
            }`}
          >
            <div className={`p-2 rounded-full ${
              card.category === 'cycle' 
                ? 'bg-purple-100 text-purple-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {card.category === 'cycle' ? (
                <Target className="w-6 h-6" />
              ) : (
                <CalendarDays className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">{card.title}</div>
              <div className="font-bold text-lg text-gray-800">{card.days_remaining} dias</div>
              <div className="text-xs text-gray-500">{card.progress_percentage}% concluído</div>
            </div>
          </div>
        ))}
        
        {/* Card Data Atual */}
        <div className="bg-gradient-to-br from-green-50 to-white flex items-center gap-3 rounded-lg border border-green-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-2 rounded-full bg-green-100 text-green-600">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Data atual</div>
            <div className="font-bold text-lg text-gray-800">
              {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
        
        {/* Card Evolução */}
        <div className="bg-gradient-to-br from-indigo-50 to-white flex items-center gap-3 rounded-lg border border-indigo-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
            {statusInfo.icon}
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Evolução</div>
            <div className="font-bold text-lg text-gray-800">
              {progressoGeral}% 
              <span className="text-xs font-normal text-gray-500">
                {activeCycle ? ` de ${percentagePrevisto}% esperado` : ` de ${percentagePrevisto}% previsto`}
              </span>
            </div>
            <div className="text-xs mt-1">
              <span className={`${statusInfo.color} font-medium`}>{statusInfo.label}</span>
            </div>
          </div>
        </div>
        
        {/* Card Objetivos */}
        <div className="bg-gradient-to-br from-amber-50 to-white flex items-center gap-3 rounded-lg border border-amber-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-2 rounded-full bg-amber-100 text-amber-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Objetivos</div>
            <div className="font-bold text-lg text-gray-800">{objectives.length}</div>
            <div className="text-xs mt-1 text-gray-500">
              {objetivosConcluidos} concluídos / {objectives.length} total
            </div>
          </div>
        </div>
      </div>

      {/* Informação do Ciclo Ativo */}
      {activeCycle && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Target className="h-4 w-4" />
            <span className="font-medium">Ciclo Ativo:</span>
            <span>{activeCycle.name}</span>
            <span className="text-green-600">
              ({activeCycle.days_remaining} dias restantes)
            </span>
          </div>
        </div>
      )}

      {/* Informação sobre ciclos disponíveis */}
      {allCycles && allCycles.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {allCycles.length} ciclo{allCycles.length !== 1 ? 's' : ''} disponível{allCycles.length !== 1 ? 'eis' : ''} para seleção nos cards temporais
        </div>
      )}
    </div>
  );
};

export default DashboardInfoCards;
