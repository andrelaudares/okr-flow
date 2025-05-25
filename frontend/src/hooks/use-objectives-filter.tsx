
import { useState } from 'react';
import { Objective } from '@/types/okr';

export const useObjectivesFilter = (objectives: Objective[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const filteredObjectives = objectives.filter((objective) => {
    const matchesSearchTerm = objective.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             objective.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' && objective.progress === 100) ||
      (statusFilter === 'in-progress' && objective.progress > 0 && objective.progress < 100) ||
      (statusFilter === 'not-started' && objective.progress === 0);
    
    // For user filter, we want to show objectives where the user is involved
    const matchesUser = userFilter === 'all' || 
      objective.activities.some(activity => activity.assignee === userFilter);
    
    return matchesSearchTerm && matchesStatus && matchesUser;
  }).map(objective => {
    // When filtering by user, only show activities assigned to that user
    if (userFilter !== 'all') {
      return {
        ...objective,
        activities: objective.activities.filter(activity => activity.assignee === userFilter)
      };
    }
    return objective;
  });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    userFilter,
    setUserFilter,
    filteredObjectives,
  };
};
