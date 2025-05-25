
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { toast } from 'sonner';

/**
 * Checks if an objective exists in the database
 * 
 * @param objectiveId - The ID of the objective to check
 * @returns A boolean indicating if the objective exists
 */
export const checkObjectiveExists = async (objectiveId: string): Promise<boolean> => {
  try {
    const { data, error } = await extendedSupabase
      .from('objectives')
      .select('id')
      .eq('id', objectiveId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking if objective exists:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Failed to check if objective exists:', err);
    return false;
  }
};

/**
 * Records a history entry for an objective's progress
 * 
 * @param objectiveId - The ID of the objective to record history for
 * @param progress - The current progress value (0-100)
 * @returns A promise that resolves when the history entry is saved
 */
export const recordObjectiveHistory = async (
  objectiveId: string, 
  progress: number
): Promise<any> => {
  try {
    console.log(`Attempting to record history for objective ${objectiveId} with progress ${progress}`);
    
    // First check if the objective exists in the database
    const exists = await checkObjectiveExists(objectiveId);
    
    if (!exists) {
      console.warn(`Objective ${objectiveId} does not exist in the database, skipping history recording`);
      return null;
    }
    
    // Create new history entry
    const { data, error } = await extendedSupabase
      .from('objectives_history')
      .insert({
        objective_id: objectiveId,
        progress: progress,
        recorded_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error recording objective history:', error);
      toast.error('Falha ao registrar histórico');
      throw error;
    }

    console.log('Successfully recorded objective history:', data);
    return data;
  } catch (err) {
    console.error('Failed to record objective history:', err);
    throw err;
  }
};
