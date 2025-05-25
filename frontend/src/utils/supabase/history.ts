
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { v4 as uuidv4 } from 'uuid';

// Record a history entry for an objective
export const recordObjectiveHistory = async (objectiveId: string, progress: number) => {
  try {
    const { error } = await extendedSupabase
      .from('objectives_history')
      .insert({
        objective_id: objectiveId,
        progress,
      });

    if (error) {
      console.error('Error recording objective history:', error);
      throw error;
    }
  } catch (err) {
    console.error('Failed to record objective history:', err);
    // Don't throw here to prevent blocking main operations
  }
};

// Ensure database has history data for all objectives
export const ensureObjectiveHistory = async (objectives: any[]) => {
  try {
    // For each objective, check if it has history entries
    for (const objective of objectives) {
      const { data: history, error } = await extendedSupabase
        .from('objectives_history')
        .select('*')
        .eq('objective_id', objective.id);
      
      if (error) {
        console.error('Error checking objective history:', error);
        continue;
      }
      
      // If no history entries exist, create an initial one
      if (!history || history.length === 0) {
        await recordObjectiveHistory(objective.id, objective.progress || 0);
      }
    }
  } catch (err) {
    console.error('Failed to ensure objective history:', err);
  }
};

// Function to retrieve all progress history for a specific objective
export const getObjectiveProgressHistory = async (objectiveId: string) => {
  try {
    const { data, error } = await extendedSupabase
      .from('objectives_history')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('recorded_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching objective history:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Failed to get objective progress history:', err);
    return [];
  }
};

// Function to retrieve all objectives progress history
export const getAllObjectivesProgressHistory = async () => {
  try {
    // First fetch all objectives to get their details
    const { data: objectives, error: objectivesError } = await extendedSupabase
      .from('objectives')
      .select('*');
    
    if (objectivesError) {
      console.error('Error fetching objectives for history:', objectivesError);
      return [];
    }
    
    if (!objectives || objectives.length === 0) {
      return [];
    }
    
    // Then fetch all history records
    const { data: history, error: historyError } = await extendedSupabase
      .from('objectives_history')
      .select('*')
      .order('recorded_at', { ascending: true });
    
    if (historyError) {
      console.error('Error fetching objective history:', historyError);
      return [];
    }
    
    return { objectives, history: history || [] };
  } catch (err) {
    console.error('Failed to get all objectives progress history:', err);
    return [];
  }
};

// Delete history for deleted objectives
export const cleanupOrphanedHistory = async () => {
  try {
    // First get all objectives
    const { data: objectives, error: objectivesError } = await extendedSupabase
      .from('objectives')
      .select('id');
    
    if (objectivesError) {
      console.error('Error fetching objectives for cleanup:', objectivesError);
      return;
    }
    
    if (!objectives || objectives.length === 0) {
      // If no objectives, potentially delete all history
      const { error: deleteError } = await extendedSupabase
        .from('objectives_history')
        .delete()
        .is('objective_id', null);
      
      if (deleteError) {
        console.error('Error cleaning up null history entries:', deleteError);
      }
      return;
    }
    
    // Get all objective IDs
    const objectiveIds = objectives.map(obj => obj.id);
    
    // Delete history entries that don't belong to any existing objective
    const { error: deleteError } = await extendedSupabase
      .from('objectives_history')
      .delete()
      .not('objective_id', 'in', `(${objectiveIds.map(id => `'${id}'`).join(',')})`);
    
    if (deleteError) {
      console.error('Error cleaning up orphaned history:', deleteError);
    }
  } catch (err) {
    console.error('Failed to clean up orphaned history:', err);
  }
};
