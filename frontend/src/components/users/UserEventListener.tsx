
import React, { useEffect } from 'react';
import { useObjectives } from '@/hooks/use-objectives';

// This component just sets up the event listener and doesn't render anything
export const UserEventListener: React.FC = () => {
  const updateAssigneeNames = useObjectives((state) => state.updateAssigneeNames);
  
  useEffect(() => {
    const handleUserNameChange = (event: CustomEvent) => {
      const { oldName, newName } = event.detail;
      updateAssigneeNames(oldName, newName);
    };
    
    // Add the event listener
    window.addEventListener('userNameChanged', handleUserNameChange as EventListener);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('userNameChanged', handleUserNameChange as EventListener);
    };
  }, [updateAssigneeNames]);
  
  return null;
};
