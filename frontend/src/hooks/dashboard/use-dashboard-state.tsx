
import { useCallback } from 'react';
import { useActionExecutor } from './use-action-executor';

/**
 * A hook that provides shared state management for objectives dashboard
 */
export const useDashboardState = () => {
  const { executeAction, isProcessing } = useActionExecutor();

  // Function to force reset processing state (useful for testing and emergencies)
  const forceResetProcessingState = useCallback(() => {
    console.log('This function is just kept for backwards compatibility');
    // Actual implementation has been moved to useProcessingState
  }, []);

  return {
    isProcessing,
    executeAction,
    forceResetProcessingState
  };
};
