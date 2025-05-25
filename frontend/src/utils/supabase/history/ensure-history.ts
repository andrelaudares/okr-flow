
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { toast } from 'sonner';
import { checkObjectiveExists } from './record-history';

/**
 * Ensures that a history entry exists for an objective
 * If no history entry exists, one will be created with the current progress
 * 
 * @param objectiveId - The ID of the objective to check history for
 * @param currentProgress - The current progress value (0-100)
 * @returns boolean indicating if a new history entry was created
 */
export const ensureObjectiveHasHistory = async (
  objectiveId: string, 
  currentProgress: number
): Promise<boolean> => {
  try {
    console.log(`Verificando histórico para objetivo ${objectiveId} com progresso ${currentProgress}`);
    
    // First check if the objective exists in the database
    const exists = await checkObjectiveExists(objectiveId);
    
    if (!exists) {
      console.warn(`Objetivo ${objectiveId} não existe no banco de dados, pulando inicialização de histórico`);
      return false;
    }
    
    // Check if any history entries exist for this objective
    const { data: historyEntries, error: queryError } = await extendedSupabase
      .from('objectives_history')
      .select('*')
      .eq('objective_id', objectiveId)
      .limit(1);
      
    if (queryError) {
      console.error('Erro ao verificar entradas de histórico:', queryError);
      toast.error('Falha ao verificar histórico');
      return false;
    }
    
    // If no history entries exist, create one with the current progress
    if (!historyEntries || historyEntries.length === 0) {
      console.log(`Nenhuma entrada de histórico encontrada para objetivo ${objectiveId}, criando entrada inicial`);
      
      const { error } = await extendedSupabase
        .from('objectives_history')
        .insert({
          objective_id: objectiveId,
          progress: currentProgress,
          recorded_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Erro ao criar entrada inicial de histórico:', error);
        toast.error('Falha ao inicializar histórico');
        return false;
      }
      
      console.log('Criada entrada inicial de histórico para objetivo', objectiveId);
      return true;
    }
    
    console.log(`Entradas de histórico existentes encontradas para objetivo ${objectiveId}, pulando inicialização`);
    return false;
  } catch (err) {
    console.error('Falha ao garantir que o objetivo tenha histórico:', err);
    toast.error('Falha ao verificar histórico');
    return false;
  }
};
