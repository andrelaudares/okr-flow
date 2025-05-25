
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { ActivityItem } from '@/types/okr';

// Add a new activity to Supabase
export const addActivityToSupabase = async (
  objectiveId: string,
  activity: Omit<ActivityItem, "id">
) => {
  const { error } = await extendedSupabase.from('activities').insert({
    objective_id: objectiveId,
    title: activity.title,
    status: activity.status,
    progress: activity.progress,
    assignee: activity.assignee,
  });

  if (error) throw error;
};

// Update an activity in Supabase
export const updateActivityInSupabase = async (
  activity: ActivityItem
) => {
  const { error } = await extendedSupabase
    .from('activities')
    .update({
      title: activity.title,
      status: activity.status,
      progress: activity.progress,
      assignee: activity.assignee,
    })
    .eq('id', activity.id);

  if (error) throw error;
};

// Delete an activity from Supabase
export const deleteActivityFromSupabase = async (
  activityId: string
) => {
  const { error } = await extendedSupabase
    .from('activities')
    .delete()
    .eq('id', activityId);

  if (error) throw error;
};
