
import { useCallback } from 'react';
import { ActivityItem } from '@/types/okr';
import { useDashboardState } from '../dashboard';
import { usePendingActions } from '@/hooks/objectives/use-pending-actions';

type ActivitySource = {
  updateActivity: (objectiveId: string, activity: ActivityItem) => void;
  deleteActivity: (objectiveId: string, activityId: string) => void;
};

/**
 * A hook that provides handlers for activity operations
 */
export const useActivityActions = (activitySource: ActivitySource) => {
  const { executeAction, isProcessing: globalIsProcessing } = useDashboardState();
  const { 
    isActionPending, 
    markActionPending, 
    markActionCompleted 
  } = usePendingActions();

  const handleUpdateActivity = useCallback((objectiveId: string, activity: ActivityItem) => {
    const actionId = `updateActivity-${activity.id}-${Date.now()}`;
    if (isActionPending(actionId) || globalIsProcessing) {
      console.log('Update activity blocked - already processing');
      return;
    }
    
    markActionPending(actionId);
    console.log(`Starting activity update for ${activity.id} with progress ${activity.progress}`);
    
    executeAction(
      () => activitySource.updateActivity(objectiveId, activity),
      { successMessage: 'Atividade atualizada com sucesso' }
    ).finally(() => {
      // Always mark action as completed, even if there was an error
      console.log(`Finalizing activity update for ${activity.id}`);
      markActionCompleted(actionId, 300);
    });
  }, [executeAction, globalIsProcessing, isActionPending, markActionPending, markActionCompleted, activitySource]);

  const handleDeleteActivity = useCallback((objectiveId: string, activityId: string) => {
    const actionId = `deleteActivity-${activityId}-${Date.now()}`;
    if (isActionPending(actionId) || globalIsProcessing) {
      console.log('Delete activity blocked - already processing');
      return;
    }
    
    markActionPending(actionId);
    
    executeAction(
      () => activitySource.deleteActivity(objectiveId, activityId),
      { successMessage: 'Atividade removida com sucesso' }
    ).finally(() => {
      // Always mark action as completed, even if there was an error
      markActionCompleted(actionId, 300);
    });
  }, [executeAction, globalIsProcessing, isActionPending, markActionPending, markActionCompleted, activitySource]);

  return {
    handleUpdateActivity,
    handleDeleteActivity
  };
};