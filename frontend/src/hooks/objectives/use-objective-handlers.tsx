
import { ActivityItem } from '@/types/okr';
import { useDashboardState } from '../dashboard';
import { useObjectiveActions } from './use-objective-actions';
import { useActivityActions } from './use-activity-actions';
import { usePendingActions } from '@/hooks/objectives/use-pending-actions';
import { useCallback } from 'react';

type ObjectiveSource = {
  addObjective: (data: { title: string; description: string }) => Promise<string | undefined> | string | undefined | void;
  addActivity: (objectiveId: string, activity: Omit<ActivityItem, "id">) => void;
  updateActivity: (objectiveId: string, activity: ActivityItem) => void;
  deleteActivity: (objectiveId: string, activityId: string) => void;
  deleteObjective: (objectiveId: string) => void;
};

/**
 * A hook that provides handlers for objective operations with improved state management
 */
export const useObjectiveHandlers = (objectiveSource: ObjectiveSource) => {
  const { executeAction, isProcessing: globalIsProcessing } = useDashboardState();
  const { 
    isActionPending, 
    markActionPending, 
    markActionCompleted,
    pendingActionsCount,
    anyActionsPending
  } = usePendingActions();

  const { handleAddObjective, handleAddActivity } = useObjectiveActions(objectiveSource);
  const { handleUpdateActivity, handleDeleteActivity } = useActivityActions(objectiveSource);
  
  const handleDeleteObjective = useCallback((objectiveId: string) => {
    const actionId = `deleteObjective-${objectiveId}-${Date.now()}`;
    if (isActionPending(actionId) || globalIsProcessing) {
      console.log('Delete objective blocked - already processing');
      return;
    }
    
    markActionPending(actionId);
    
    executeAction(
      () => objectiveSource.deleteObjective(objectiveId),
      { successMessage: 'Objetivo removido com sucesso' }
    ).finally(() => {
      // Always mark action as completed, even if there was an error
      markActionCompleted(actionId, 300);
    });
  }, [executeAction, globalIsProcessing, isActionPending, markActionPending, markActionCompleted, objectiveSource]);

  return {
    handleAddObjective,
    handleAddActivity,
    handleUpdateActivity,
    handleDeleteActivity,
    handleDeleteObjective,
    isActionPending,
    pendingActionsCount,
    anyActionsPending
  };
};