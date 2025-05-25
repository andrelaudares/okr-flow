
import { useState, useRef, useEffect } from 'react';

/**
 * A hook that manages the processing state with safety mechanisms
 */
export const useProcessingState = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const mountedRef = useRef(true);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessingStartTime = useRef<number | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    console.log('useProcessingState mounted');
    
    return () => {
      console.log('useProcessingState unmounted, cleaning up');
      mountedRef.current = false;
      
      // Clear any pending timers
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
        processingTimerRef.current = null;
      }
    };
  }, []);
  
  // Enhanced safety mechanism to ensure isProcessing doesn't stay stuck
  useEffect(() => {
    // Log state changes for debugging
    console.log('Processing state changed:', isProcessing);
    
    // Record start time when processing starts
    if (isProcessing) {
      lastProcessingStartTime.current = Date.now();
      
      // Clear any existing safety timer
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
      }
      
      // Set a new safety timer (reduced to 5 seconds for faster recovery)
      processingTimerRef.current = setTimeout(() => {
        if (mountedRef.current && isProcessing) {
          const duration = Date.now() - (lastProcessingStartTime.current || Date.now());
          console.warn(`Safety timeout triggered - processing state was stuck for ${duration/1000} seconds`);
          setIsProcessing(false);
        }
        processingTimerRef.current = null;
        lastProcessingStartTime.current = null;
      }, 5000);
    } else {
      // Clear safety timer when not processing
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
        processingTimerRef.current = null;
      }
      lastProcessingStartTime.current = null;
    }
    
    // Clean up the timeout when effect reruns or component unmounts
    return () => {
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
        processingTimerRef.current = null;
      }
    };
  }, [isProcessing]);

  return {
    isProcessing,
    setIsProcessing,
    mountedRef,
    lastProcessingStartTime
  };
};
