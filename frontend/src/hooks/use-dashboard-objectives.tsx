import { useCallback, useMemo } from 'react';
import { useObjectives } from '@/hooks/use-objectives';
import { useSupabaseObjectives } from '@/hooks/use-supabase-objectives';
import { useDashboardState } from './dashboard/use-dashboard-state';
import { useObjectiveHandlers } from './objectives';

export const useDashboardObjectives = () => {
  const { isProcessing } = useDashboardState();

  const {
    objectives: localObjectives,
    addObjective: addLocalObjective,
    addActivity: addLocalActivity,
    updateActivity: updateLocalActivity,
    deleteActivity: deleteLocalActivity,
    deleteObjective: deleteLocalObjective
  } = useObjectives();

  const {
    objectives: remoteObjectives,
    isLoading,
    addObjective: addRemoteObjective,
    addActivity: addRemoteActivity,
    updateActivity: updateRemoteActivity,
    deleteActivity: deleteRemoteActivity,
    deleteObjective: deleteRemoteObjective
  } = useSupabaseObjectives();

  // Determine if we're using remote data (from Supabase)
  const isUsingRemoteData = useMemo(() => {
    return remoteObjectives.length > 0;
  }, [remoteObjectives.length]);

  // Determine which data source to use - remote (Supabase) or local (Zustand)
  const objectives = useMemo(() => {
    if (isUsingRemoteData) {
      console.log('Using remote objectives from Supabase:', remoteObjectives.length);
      return remoteObjectives;
    } else {
      console.log('Using local objectives from Zustand:', localObjectives.length);
      return localObjectives;
    }
  }, [isUsingRemoteData, remoteObjectives, localObjectives]);
  
  // Create a source object based on whether we're using remote or local data
  const objectiveSource = useCallback(() => {
    if (isUsingRemoteData) {
      console.log('Using remote objectives from Supabase');
      return {
        addObjective: (data: { title: string; description: string }) => {
          return addRemoteObjective(data);
        },
        addActivity: addRemoteActivity, 
        updateActivity: updateRemoteActivity,
        deleteActivity: deleteRemoteActivity,
        deleteObjective: deleteRemoteObjective
      };
    } else {
      console.log('Using local objectives from Zustand');
      return {
        addObjective: (data: { title: string; description: string }) => {
          return addLocalObjective(data);
        },
        addActivity: addLocalActivity,
        updateActivity: updateLocalActivity,
        deleteActivity: deleteLocalActivity,
        deleteObjective: deleteLocalObjective
      };
    }
  }, [
    isUsingRemoteData,
    addRemoteObjective, addRemoteActivity, updateRemoteActivity, deleteRemoteActivity, deleteRemoteObjective,
    addLocalObjective, addLocalActivity, updateLocalActivity, deleteLocalActivity, deleteLocalObjective
  ]);
  
  // Get handlers using the appropriate source
  const {
    handleAddObjective,
    handleAddActivity,
    handleUpdateActivity,
    handleDeleteActivity,
    handleDeleteObjective
  } = useObjectiveHandlers(objectiveSource());

  return {
    objectives,
    isLoading,
    isProcessing,
    isUsingRemoteData,
    handleAddObjective,
    handleAddActivity,
    handleUpdateActivity,
    handleDeleteActivity,
    handleDeleteObjective,
  };
};
