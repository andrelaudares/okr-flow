
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * A hook that manages pending actions with timeout tracking
 */
export const usePendingActions = () => {
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const pendingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const mountedRef = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Clear all pending timeouts
      pendingTimeoutsRef.current.forEach(timeout => {
        clearTimeout(timeout);
      });
      pendingTimeoutsRef.current.clear();
    };
  }, []);

  // Helper to check if an action is pending
  const isActionPending = useCallback((actionId: string) => {
    return pendingActions.has(actionId);
  }, [pendingActions]);

  // Helper to mark an action as pending with improved timeout tracking
  const markActionPending = useCallback((actionId: string) => {
    if (!mountedRef.current) return;
    
    console.log(`Marking action as pending: ${actionId}`);
    setPendingActions(prev => new Set(prev).add(actionId));
    
    // Set a safety timeout to clear this action after 5 seconds if it gets stuck
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current) {
        console.warn(`Safety timeout triggered for action: ${actionId}`);
        setPendingActions(prev => {
          const next = new Set(prev);
          next.delete(actionId);
          return next;
        });
        pendingTimeoutsRef.current.delete(actionId);
      }
    }, 5000);
    
    // Store the timeout reference for cleanup
    pendingTimeoutsRef.current.set(actionId, safetyTimeout);
  }, []);

  // Helper to mark an action as completed with improved timeout handling
  const markActionCompleted = useCallback((actionId: string, delay: number = 300) => {
    if (!mountedRef.current) return;
    
    // Clear any existing timeout for this action
    if (pendingTimeoutsRef.current.has(actionId)) {
      clearTimeout(pendingTimeoutsRef.current.get(actionId)!);
      pendingTimeoutsRef.current.delete(actionId);
    }
    
    // Set timeout to mark action as completed after delay
    const completionTimeout = setTimeout(() => {
      if (mountedRef.current) {
        console.log(`Marking action as completed: ${actionId}`);
        setPendingActions(prev => {
          const next = new Set(prev);
          next.delete(actionId);
          return next;
        });
        pendingTimeoutsRef.current.delete(actionId);
      }
    }, delay);
    
    // Store the timeout reference
    pendingTimeoutsRef.current.set(actionId, completionTimeout);
  }, []);

  return {
    isActionPending,
    markActionPending,
    markActionCompleted,
    pendingActionsCount: pendingActions.size,
    anyActionsPending: pendingActions.size > 0
  };
};