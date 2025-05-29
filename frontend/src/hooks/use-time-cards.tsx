import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { TimeCard, TimeCardsResponse, UpdateTimePreferencesData, AvailableCard } from '@/types/time-cards';

// Chave para localStorage
const CYCLE_PREFERENCES_KEY = 'nobug_okr_cycle_preferences';

// Hook para gestão dos cards temporais
export const useTimeCards = () => {
  const queryClient = useQueryClient();

  // Query para buscar cards temporais
  const {
    data: timeCardsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'time-cards'],
    queryFn: async (): Promise<TimeCardsResponse> => {
      const response = await api.get('/api/dashboard/time-cards');
      return response.data;
    },
    enabled: !!localStorage.getItem('nobugOkrToken'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Funções para gerenciar preferências de ciclos localmente
  const getLocalCyclePreferences = (): string[] => {
    try {
      const stored = localStorage.getItem(CYCLE_PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setLocalCyclePreferences = (cycleIds: string[]) => {
    try {
      localStorage.setItem(CYCLE_PREFERENCES_KEY, JSON.stringify(cycleIds));
    } catch (error) {
      console.error('Erro ao salvar preferências de ciclos:', error);
    }
  };

  // Mutation para atualizar preferências
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: UpdateTimePreferencesData): Promise<{ message: string }> => {
      // Separar cards temporais e ciclos
      const timeCards = data.selected_cards.filter(card => !card.startsWith('CYCLE_'));
      const cycleCards = data.selected_cards.filter(card => card.startsWith('CYCLE_'));
      
      // Salvar ciclos localmente
      setLocalCyclePreferences(cycleCards);
      
      // Enviar apenas cards temporais para o backend
      const response = await api.put('/api/dashboard/time-preferences', { 
        selected_cards: timeCards 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'time-cards'] });
      toast.success('Preferências atualizadas com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar preferências:', error);
      toast.error(error.message || 'Erro ao atualizar preferências');
    },
  });

  // Obter todos os cards disponíveis (incluindo todos os ciclos)
  const getAllAvailableCards = (): AvailableCard[] => {
    const timeCards = timeCardsData?.time_cards || [];
    const allCycles = timeCardsData?.all_cycles || [];
    
    // Cards temporais padrão
    const availableCards: AvailableCard[] = timeCards.map(card => ({
      id: card.type,
      type: card.type,
      title: card.title,
      description: `${card.period} - ${card.progress_percentage}% concluído`,
      category: 'temporal',
    }));

    // Adicionar todos os ciclos disponíveis
    allCycles.forEach(cycle => {
      availableCards.push({
        id: `CYCLE_${cycle.id}`,
        type: 'CYCLE',
        title: `Ciclo: ${cycle.name}`,
        description: `${cycle.progress_percentage}% concluído - ${cycle.days_remaining} dias restantes`,
        category: 'cycle',
      });
    });

    return availableCards;
  };

  // Verificar se um card está selecionado (combinando backend + localStorage)
  const isCardSelected = (cardId: string) => {
    if (cardId.startsWith('CYCLE_')) {
      const localCycles = getLocalCyclePreferences();
      return localCycles.includes(cardId);
    }
    
    const selectedCards = timeCardsData?.user_preferences?.selected_cards || [];
    return selectedCards.includes(cardId);
  };

  // Obter todos os cards selecionados (combinando backend + localStorage)
  const getAllSelectedCards = (): string[] => {
    const backendCards = timeCardsData?.user_preferences?.selected_cards || [];
    const localCycles = getLocalCyclePreferences();
    return [...backendCards, ...localCycles];
  };

  // Obter cards visíveis (selecionados)
  const getVisibleCards = () => {
    const backendSelectedCards = timeCardsData?.user_preferences?.selected_cards || [];
    const localSelectedCycles = getLocalCyclePreferences();
    const timeCards = timeCardsData?.time_cards || [];
    const allCycles = timeCardsData?.all_cycles || [];
    
    const visibleCards: (TimeCard & { category: 'temporal' | 'cycle' })[] = [];

    // Adicionar cards temporais selecionados (do backend)
    timeCards.forEach(card => {
      if (backendSelectedCards.includes(card.type)) {
        visibleCards.push({
          ...card,
          category: 'temporal',
        });
      }
    });

    // Adicionar ciclos selecionados (do localStorage)
    allCycles.forEach(cycle => {
      const cycleId = `CYCLE_${cycle.id}`;
      if (localSelectedCycles.includes(cycleId)) {
        visibleCards.push({
          type: 'CYCLE',
          title: `Ciclo: ${cycle.name}`,
          period: `${new Date(cycle.start_date).toLocaleDateString('pt-BR')} - ${new Date(cycle.end_date).toLocaleDateString('pt-BR')}`,
          progress_percentage: cycle.progress_percentage,
          days_total: cycle.days_total,
          days_elapsed: cycle.days_elapsed,
          days_remaining: cycle.days_remaining,
          start_date: cycle.start_date,
          end_date: cycle.end_date,
          category: 'cycle',
        });
      }
    });

    return visibleCards;
  };

  // Verificar se pode adicionar mais cards (máximo 2 ciclos)
  const canAddMoreCycles = () => {
    const localCycles = getLocalCyclePreferences();
    return localCycles.length < 2;
  };

  // Obter ciclos selecionados
  const getSelectedCycles = () => {
    return getLocalCyclePreferences();
  };

  // Obter contagem de ciclos selecionados
  const getSelectedCyclesCount = () => {
    return getLocalCyclePreferences().length;
  };

  return {
    // Dados
    timeCards: timeCardsData?.time_cards || [],
    selectedCards: getAllSelectedCards(), // ATUALIZADO: combina backend + localStorage
    activeCycle: timeCardsData?.active_cycle || null,
    allCycles: timeCardsData?.all_cycles || [],
    
    // Estados
    isLoading,
    isError: !!error,
    error,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    
    // Funções
    updatePreferences: updatePreferencesMutation.mutateAsync,
    refetch,
    
    // Funções para cards avançados
    getAllAvailableCards,
    isCardSelected,
    getVisibleCards,
    canAddMoreCycles,
    getSelectedCycles,
    getSelectedCyclesCount,
  };
}; 