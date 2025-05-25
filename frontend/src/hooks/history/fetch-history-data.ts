
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { Objective } from '@/types/okr';

/**
 * Fetch objectives with their activities
 */
export const fetchObjectivesForHistory = async (): Promise<Objective[]> => {
  console.log('Buscando objetivos para histórico...');
  try {
    // Fetch objectives from Supabase
    const { data: objectivesData, error: objectivesError } = await extendedSupabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });

    if (objectivesError) {
      console.error('Erro ao buscar objetivos:', objectivesError);
      throw objectivesError;
    }

    console.log(`Encontrados ${objectivesData?.length || 0} objetivos.`);

    // Fetch activities for each objective
    const { data: activitiesData, error: activitiesError } = await extendedSupabase
      .from('activities')
      .select('*');

    if (activitiesError) {
      console.error('Erro ao buscar atividades:', activitiesError);
      throw activitiesError;
    }

    console.log(`Encontradas ${activitiesData?.length || 0} atividades.`);

    // Group activities by objective_id
    const activitiesByObjective: Record<string, any[]> = {};
    activitiesData?.forEach((activity) => {
      if (!activitiesByObjective[activity.objective_id]) {
        activitiesByObjective[activity.objective_id] = [];
      }
      activitiesByObjective[activity.objective_id].push(activity);
    });

    // Combine objectives with their activities
    return (objectivesData || []).map((obj: any): Objective => ({
      id: obj.id,
      title: obj.title,
      description: obj.description || '',
      progress: obj.progress || 0,
      createdAt: obj.created_at,
      activities: (activitiesByObjective[obj.id] || []).map((act: any) => ({
        id: act.id,
        title: act.title,
        status: act.status,
        progress: act.progress || 0,
        assignee: act.assignee || '',
      })),
    }));
  } catch (error) {
    console.error('Erro ao buscar objetivos para histórico:', error);
    return [];
  }
};

/**
 * Fetch history records for objectives
 */
export const fetchHistoryRecords = async () => {
  console.log('Buscando registros de histórico...');
  try {
    const { data, error } = await extendedSupabase
      .from('objectives_history')
      .select('*')
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar dados históricos:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} registros históricos.`);
    
    if (data && data.length > 0) {
      console.log('Amostra de dados históricos:', data.slice(0, 2));
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar dados históricos:', error);
    return [];
  }
};
