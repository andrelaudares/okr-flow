
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { ActivityItem, Objective } from '@/types/okr';

// Fetch objectives from Supabase
export const fetchObjectives = async () => {
  const { data: objectives, error } = await extendedSupabase
    .from('objectives')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching objectives:', error);
    throw error;
  }

  return objectives || [];
};

// Fetch activities from Supabase
export const fetchActivities = async () => {
  const { data: activities, error } = await extendedSupabase
    .from('activities')
    .select('*')
    .order('created_at');

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return activities || [];
};

// Combine objectives and activities
export const combineObjectivesWithActivities = (
  objectives: any[], 
  activities: any[]
): Objective[] => {
  return objectives.map((obj: any): Objective => {
    const relatedActivities = activities
      .filter((act: any) => act.objective_id === obj.id)
      .map((act: any): ActivityItem => ({
        id: act.id,
        title: act.title,
        status: act.status,
        progress: act.progress || 0,
        assignee: act.assignee || '',
      }));

    return {
      id: obj.id,
      title: obj.title,
      description: obj.description || '',
      progress: obj.progress || 0,
      createdAt: obj.created_at,
      activities: relatedActivities,
    };
  });
};
