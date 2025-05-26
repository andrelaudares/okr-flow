import { useCallback } from 'react';
import { useObjectives } from '@/hooks/use-objectives';

export const useDashboardObjectives = () => {
  const {
    objectives,
    isLoading,
    addObjective,
    deleteObjective,
    addActivity,
    updateActivity,
    deleteActivity,
    isAddingObjective,
    isDeletingObjective
  } = useObjectives();

  // Handlers para compatibilidade com o Dashboard existente
  const handleAddObjective = useCallback(async (data: { title: string; description: string }) => {
    return await addObjective(data);
  }, [addObjective]);

  const handleAddActivity = useCallback((objectiveId: string, activity: any) => {
    addActivity(objectiveId, activity);
  }, [addActivity]);

  const handleUpdateActivity = useCallback((objectiveId: string, activity: any) => {
    updateActivity(objectiveId, activity);
  }, [updateActivity]);

  const handleDeleteActivity = useCallback((objectiveId: string, activityId: string) => {
    deleteActivity(objectiveId, activityId);
  }, [deleteActivity]);

  const handleDeleteObjective = useCallback((objectiveId: string) => {
    deleteObjective(objectiveId);
  }, [deleteObjective]);

  return {
    objectives,
    isLoading,
    isProcessing: isAddingObjective || isDeletingObjective,
    isUsingRemoteData: true, // Sempre usando API agora
    handleAddObjective,
    handleAddActivity,
    handleUpdateActivity,
    handleDeleteActivity,
    handleDeleteObjective,
  };
};
