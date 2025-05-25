
import { useState, useCallback, useEffect, useRef } from 'react';
import { ActivityItem } from '@/types/okr';
import { toast } from 'sonner';

interface UseActivityCardProps {
  activity: ActivityItem;
  onUpdate: (updatedActivity: ActivityItem) => void;
  disabled?: boolean;
}

export const useActivityCard = ({ activity, onUpdate, disabled = false }: UseActivityCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [progress, setProgress] = useState(activity.progress);
  const [isUpdating, setIsUpdating] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastActivityUpdateRef = useRef<string>(`${activity.id}-${activity.progress}`);
  
  // Cleanup function to run on unmount
  useEffect(() => {
    console.log('ActivityCard mounted', { id: activity.id });
    
    return () => {
      console.log('ActivityCard unmounted', { id: activity.id });
      isMountedRef.current = false;
      
      // Clean up any pending timers
      if (debounceTimerRef.current) {
        console.log('Cleaning up debounce timer on unmount');
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [activity.id]);
  
  // Update local progress when activity prop changes and track if it was an external update
  useEffect(() => {
    const currentActivityKey = `${activity.id}-${activity.progress}`;
    const isExternalUpdate = currentActivityKey !== lastActivityUpdateRef.current;
    
    console.log('ActivityCard: Activity prop updated', { 
      id: activity.id,
      progress: activity.progress,
      localProgress: progress,
      isUpdating,
      isExternalUpdate
    });
    
    // Only update local state if it's an external update or we're not currently updating
    if (isExternalUpdate && !isUpdating) {
      setProgress(activity.progress);
      lastActivityUpdateRef.current = currentActivityKey;
    } else if (!isUpdating) {
      // If we're not updating and this wasn't external, it's safe to sync
      setProgress(activity.progress);
    }
    
  }, [activity, activity.progress, isUpdating, progress]);
  
  // Handle progress slider changes with improved debounce
  const handleProgressChange = useCallback((newProgress: number[]) => {
    if (isUpdating || disabled) {
      console.log('Progress change ignored - component is busy or disabled', { isUpdating, disabled });
      return;
    }
    
    const value = newProgress[0];
    console.log('Progress change initiated', { 
      from: progress, 
      to: value, 
      activityId: activity.id,
      hasTimer: !!debounceTimerRef.current 
    });
    
    // Update local state immediately for responsive UI
    setProgress(value);
    
    // Clear existing timer to avoid multiple updates
    if (debounceTimerRef.current) {
      console.log('Clearing existing debounce timer');
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      // Safety check if component is still mounted
      if (!isMountedRef.current) {
        console.log('Component unmounted, cancelling progress update');
        return;
      }
      
      // Update ref to track this change
      lastActivityUpdateRef.current = `${activity.id}-${value}`;
      
      console.log('Debounce timer triggered, updating activity', { value, activityId: activity.id });
      setIsUpdating(true);
      
      const updatedActivity = { ...activity, progress: value };
      
      try {
        onUpdate(updatedActivity);
        console.log('onUpdate called', { updatedActivity });
      } catch (error) {
        console.error('Error updating activity progress:', error);
        toast.error('Erro ao atualizar progresso');
        // Reset to original on error
        setProgress(activity.progress); 
      } finally {
        // Safety cleanup for timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        
        // Reset updating state after delay to ensure UI stability
        const resetTimer = setTimeout(() => {
          if (isMountedRef.current) {
            console.log('Resetting isUpdating state', { activityId: activity.id });
            setIsUpdating(false);
          }
        }, 500);
        
        // Safety cleanup for reset timer
        if (!isMountedRef.current && resetTimer) {
          clearTimeout(resetTimer);
        }
      }
    }, 400); // Slightly reduced debounce to improve responsiveness
  }, [activity, onUpdate, isUpdating, disabled, progress]);
  
  // Handle full activity update with improved state handling
  const handleUpdateActivity = useCallback((updatedActivity: ActivityItem) => {
    if (isUpdating || disabled) {
      console.log('Activity update ignored - component is busy or disabled', { isUpdating, disabled });
      return;
    }
    
    console.log('Full activity update initiated', { activityId: activity.id });
    
    // Update reference to track this change
    lastActivityUpdateRef.current = `${updatedActivity.id}-${updatedActivity.progress}`;
    
    setIsUpdating(true);
    
    try {
      onUpdate(updatedActivity);
      console.log('Full activity update completed', { activityId: activity.id });
      
      // Close dialog immediately to improve perceived responsiveness
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Erro ao atualizar atividade');
    } finally {
      // Reset updating state after a short delay to ensure stability
      const resetTimer = setTimeout(() => {
        if (isMountedRef.current) {
          console.log('Completing activity update, resetting state', { activityId: activity.id });
          setIsUpdating(false);
        }
      }, 500);
      
      // Safety cleanup
      if (!isMountedRef.current && resetTimer) {
        clearTimeout(resetTimer);
      }
    }
  }, [onUpdate, isUpdating, disabled, activity.id]);

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    progress,
    isUpdating,
    handleProgressChange,
    handleUpdateActivity
  };
};
