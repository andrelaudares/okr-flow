
import { extendedSupabase } from '@/integrations/supabase/extended-client';

/**
 * Clears all history data for a specific objective
 * 
 * @param objectiveId - The ID of the objective to clear history for
 */
export const clearObjectiveHistory = async (objectiveId: string) => {
  try {
    const { error } = await extendedSupabase
      .from('objectives_history')
      .delete()
      .eq('objective_id', objectiveId);
      
    if (error) {
      console.error('Error clearing objective history:', error);
      throw error;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to clear objective history:', err);
    throw err;
  }
};
