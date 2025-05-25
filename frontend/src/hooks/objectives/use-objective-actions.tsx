
import { useCallback } from 'react';
import { ActivityItem } from '@/types/okr';
import { useDashboardState } from '../dashboard';
import { usePendingActions } from '@/hooks/objectives/use-pending-actions';

type ObjectiveSource = {
  addObjective: (data: { title: string; description: string }) => Promise<string | undefined> | string | undefined | void;
  addActivity: (objectiveId: string, activity: Omit<ActivityItem, "id">) => void;
  updateActivity: (objectiveId: string, activity: ActivityItem) => void;
  deleteActivity: (objectiveId: string, activityId: string) => void;
  deleteObjective: (objectiveId: string) => void;
};

/**
 * A hook that provides handlers for objective operations
 */
export const useObjectiveActions = (objectiveSource: ObjectiveSource) => {
  const { executeAction, isProcessing: globalIsProcessing } = useDashboardState();
  const { 
    isActionPending, 
    markActionPending, 
    markActionCompleted,
    pendingActionsCount,
    anyActionsPending
  } = usePendingActions();
  
  const handleAddObjective = useCallback(async (data: { title: string; description: string }) => {
    const actionId = `addObjective-${Date.now()}`;
    if (isActionPending(actionId) || globalIsProcessing) {
      console.log('Add objective blocked - already processing');
      return;
    }
    
    markActionPending(actionId);
    
    try {
      const result = await executeAction(
        async () => {
          const result = await objectiveSource.addObjective(data);
          return result;
        },
        { successMessage: 'Objetivo criado com sucesso' }
      );
      
      return result;
    } finally {
      // Always mark action as completed, even if there was an error
      markActionCompleted(actionId, 300);
    }
  }, [executeAction, globalIsProcessing, isActionPending, markActionPending, markActionCompleted, objectiveSource]);

  const handleAddActivity = useCallback((objectiveId: string, activity: Omit<ActivityItem, 'id'>) => {
    const actionId = `addActivity-${objectiveId}-${Date.now()}`;
    if (isActionPending(actionId) || globalIsProcessing) {
      console.log('Add activity blocked - already processing');
      return;
    }
    
    markActionPending(actionId);
    
    executeAction(
      () => objectiveSource.addActivity(objectiveId, activity),
      { successMessage: 'Atividade adicionada com sucesso' }
    ).finally(() => {
      // Always mark action as completed, even if there was an error
      markActionCompleted(actionId, 300);
    });
  }, [executeAction, globalIsProcessing, isActionPending, markActionPending, markActionCompleted, objectiveSource]);

  return {
    handleAddObjective,
    handleAddActivity,
    isActionPending,
    pendingActionsCount,
    anyActionsPending
  };
};