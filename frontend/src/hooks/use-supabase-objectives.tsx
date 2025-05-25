
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityItem, Objective } from '@/types/okr';
import { toast } from 'sonner';
import { useMemo } from 'react';

// Import the utility functions
import { fetchObjectives, fetchActivities, combineObjectivesWithActivities } from '@/utils/supabase/query-utils';
import { addObjectiveToSupabase, deleteObjectiveFromSupabase, updateObjectiveInSupabase } from '@/utils/supabase/objective-mutations';
import { addActivityToSupabase, updateActivityInSupabase, deleteActivityFromSupabase } from '@/utils/supabase/activity-mutations';
import { recordObjectiveHistory } from '@/utils/supabase/history';

export const useSupabaseObjectives = () => {
  const queryClient = useQueryClient();

  // Fetch objectives query
  const objectivesQuery = useQuery({
    queryKey: ['objectives'],
    queryFn: fetchObjectives,
  });

  // Fetch activities query
  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    enabled: objectivesQuery.isSuccess, // Fetch activities only if objectives are loaded
  });

  // Combine the data of objectives with related activities
  const objectives = useMemo(() => {
    if (objectivesQuery.data && activitiesQuery.data) {
      return combineObjectivesWithActivities(objectivesQuery.data, activitiesQuery.data);
    }
    return [];
  }, [objectivesQuery.data, activitiesQuery.data]);

  const isLoading = objectivesQuery.isLoading || activitiesQuery.isLoading;

  // Add objective mutation
  const addObjective = useMutation({
    mutationFn: async (data: {title: string; description: string}) => {
      // Add objective and get new objective ID
      const objectiveId = await addObjectiveToSupabase(data);
      
      // Record initial history entry for the objective
      await recordObjectiveHistory(objectiveId, 0);
      
      return objectiveId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-history'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-progress-history'] });
    },
    onError: (error) => {
      console.error('Error adding objective:', error);
      toast.error('Erro ao criar objetivo. Tente novamente.');
    }
  });

  // Add activity mutation
  const addActivity = useMutation({
    mutationFn: async ({ objectiveId, activity }: { objectiveId: string; activity: Omit<ActivityItem, "id"> }) => {
      // Add activity
      await addActivityToSupabase(objectiveId, activity);
      
      // Calculate new progress for the objective
      const objective = objectives.find(obj => obj.id === objectiveId);
      if (objective) {
        const activities = [...objective.activities, activity as ActivityItem];
        const newProgress = calculateObjectiveProgress(activities);
        
        // Update objective progress
        await updateObjectiveInSupabase(objectiveId, { progress: newProgress });
        
        // Record history entry
        await recordObjectiveHistory(objectiveId, newProgress);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-history'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-progress-history'] });
    },
    onError: (error) => {
      console.error('Error adding activity:', error);
      toast.error('Erro ao adicionar atividade. Tente novamente.');
    }
  });

  // Update activity mutation
  const updateActivity = useMutation({
    mutationFn: async ({ objectiveId, activity }: { objectiveId: string; activity: ActivityItem }) => {
      // Update activity
      await updateActivityInSupabase(activity);
      
      // Calculate new progress for the objective
      const objective = objectives.find(obj => obj.id === objectiveId);
      if (objective) {
        const updatedActivities = objective.activities.map(a => 
          a.id === activity.id ? activity : a
        );
        
        const newProgress = calculateObjectiveProgress(updatedActivities);
        
        // Update objective progress
        await updateObjectiveInSupabase(objectiveId, { progress: newProgress });
        
        // Record history entry
        await recordObjectiveHistory(objectiveId, newProgress);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-history'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-progress-history'] });
    },
    onError: (error) => {
      console.error('Error updating activity:', error);
      toast.error('Erro ao atualizar atividade. Tente novamente.');
    }
  });

  // Delete activity mutation
  const deleteActivity = useMutation({
    mutationFn: async ({ objectiveId, activityId }: { objectiveId: string; activityId: string }) => {
      // Delete activity
      await deleteActivityFromSupabase(activityId);
      
      // Calculate new progress for the objective
      const objective = objectives.find(obj => obj.id === objectiveId);
      if (objective) {
        const updatedActivities = objective.activities.filter(a => a.id !== activityId);
        const newProgress = calculateObjectiveProgress(updatedActivities);
        
        // Update objective progress
        await updateObjectiveInSupabase(objectiveId, { progress: newProgress });
        
        // Record history entry
        await recordObjectiveHistory(objectiveId, newProgress);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-history'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-progress-history'] });
    },
    onError: (error) => {
      console.error('Error deleting activity:', error);
      toast.error('Erro ao remover atividade. Tente novamente.');
    }
  });

  // Delete objective mutation
  const deleteObjective = useMutation({
    mutationFn: deleteObjectiveFromSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-history'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-progress-history'] });
    },
    onError: (error) => {
      console.error('Error deleting objective:', error);
      toast.error('Erro ao remover objetivo. Tente novamente.');
    }
  });
  
  // Helper function to calculate objective progress based on activities
  const calculateObjectiveProgress = (activities: ActivityItem[]): number => {
    if (!activities.length) return 0;
    
    const totalProgress = activities.reduce((sum, act) => sum + act.progress, 0);
    return Math.round(totalProgress / activities.length);
  };

  return {
    objectives,
    isLoading,
    addObjective: addObjective.mutate,
    addActivity: (objectiveId: string, activity: Omit<ActivityItem, "id">) => {
      addActivity.mutate({ objectiveId, activity });
    },
    updateActivity: (objectiveId: string, activity: ActivityItem) => {
      updateActivity.mutate({ objectiveId, activity });
    },
    deleteActivity: (objectiveId: string, activityId: string) => {
      deleteActivity.mutate({ objectiveId, activityId });
    },
    deleteObjective: deleteObjective.mutate,
  };
};
