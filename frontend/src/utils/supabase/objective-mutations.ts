
import { extendedSupabase } from '@/integrations/supabase/extended-client';

// Add a new objective to Supabase
export const addObjectiveToSupabase = async (data: { title: string; description: string }) => {
  const { data: userData } = await extendedSupabase.auth.getUser();
  const userId = userData.user?.id || '';
  
  const { data: objective, error } = await extendedSupabase
    .from('objectives')
    .insert({
      title: data.title,
      description: data.description,
      progress: 0,
      user_id: userId
    })
    .select()
    .single();

  if (error) throw error;
  return objective.id;
};

// Update an objective in Supabase
export const updateObjectiveInSupabase = async (
  objectiveId: string, 
  data: { title?: string; description?: string; progress?: number }
) => {
  const { error } = await extendedSupabase
    .from('objectives')
    .update({
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.progress !== undefined && { progress: data.progress }),
      updated_at: new Date().toISOString()
    })
    .eq('id', objectiveId);

  if (error) throw error;
};

// Delete an objective from Supabase
export const deleteObjectiveFromSupabase = async (objectiveId: string) => {
  // First remove the activities related to the objective
  const { error: activitiesError } = await extendedSupabase
    .from('activities')
    .delete()
    .eq('objective_id', objectiveId);
  
  if (activitiesError) throw activitiesError;
  
  // Then remove the objective
  const { error } = await extendedSupabase
    .from('objectives')
    .delete()
    .eq('id', objectiveId);

  if (error) throw error;
};
