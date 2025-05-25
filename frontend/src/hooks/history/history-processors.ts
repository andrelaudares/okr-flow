
import { Objective } from '@/types/okr';
import { HistoryDataPoint, ObjectiveHistoryData } from './types';

/**
 * Generate historical data for objectives
 */
export const generateObjectiveHistory = (
  objectives: Objective[], 
  historyData: any[]
): ObjectiveHistoryData[] => {
  console.log('Iniciando processamento de histórico para', objectives.length, 'objetivos e', historyData?.length, 'registros de histórico');
  
  if (!objectives?.length || !historyData?.length) {
    console.log('Sem dados suficientes para gerar histórico');
    return [];
  }
  
  try {
    const result = objectives.map((objective) => {
      // Find history records for this objective
      const objectiveHistoryRecords = (historyData || [])
        .filter((record: any) => {
          const match = record.objective_id === objective.id;
          if (!match) {
            return false;
          }
          return true;
        })
        .map((record: any) => ({
          date: record.recorded_at ? record.recorded_at.split('T')[0] : new Date().toISOString().split('T')[0],
          value: record.progress || 0,
          objectiveId: record.objective_id,
          objectiveTitle: objective.title,
        }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(`Objetivo ${objective.id} (${objective.title}): ${objectiveHistoryRecords.length} registros de histórico`);
      
      return {
        objective,
        progressHistory: objectiveHistoryRecords,
      };
    }).filter(item => item.progressHistory.length > 0);
    
    console.log('Histórico processado:', result.length, 'objetivos têm dados de histórico');
    return result;
  } catch (error) {
    console.error('Erro ao gerar histórico de objetivos:', error);
    return [];
  }
};

/**
 * Calculate overall progress history (average across all objectives)
 */
export const calculateOverallProgressHistory = (historyData: any[]): HistoryDataPoint[] => {
  if (!historyData || !historyData.length) {
    console.log('Sem dados históricos para calcular progresso geral');
    return [];
  }
  
  try {
    // Group by date with better date parsing
    const progressByDate = new Map<string, { total: number, count: number }>();
    
    historyData.forEach((record: any) => {
      // Ensure we have a valid date format
      const date = record.recorded_at ? record.recorded_at.split('T')[0] : '';
      if (!date) {
        console.warn('Registro sem data encontrado:', record);
        return;
      }
      
      if (!progressByDate.has(date)) {
        progressByDate.set(date, { total: 0, count: 0 });
      }
      const current = progressByDate.get(date)!;
      current.total += record.progress || 0;
      current.count += 1;
    });
    
    // Calculate averages by date
    const result: HistoryDataPoint[] = [];
    progressByDate.forEach((value, date) => {
      const average = value.count > 0 ? Math.round(value.total / value.count) : 0;
      result.push({
        date,
        value: average,
      });
    });
    
    // Sort by date
    const sortedResult = result.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    console.log('Calculado histórico geral com', sortedResult.length, 'pontos de dados');
    return sortedResult;
  } catch (error) {
    console.error('Erro ao calcular histórico de progresso geral:', error);
    return [];
  }
};
