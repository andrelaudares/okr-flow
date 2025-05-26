
import { useState } from 'react';
import { Objective } from '@/types/okr';

export const useObjectivesFilter = (objectives: Objective[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const filteredObjectives = objectives.filter((objective) => {
    const matchesSearchTerm = objective.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (objective.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' && objective.progress === 100) ||
      (statusFilter === 'in-progress' && objective.progress > 0 && objective.progress < 100) ||
      (statusFilter === 'not-started' && objective.progress === 0);
    
    // For user filter, usar owner_name por enquanto (activities serão implementadas depois)
    const matchesUser = userFilter === 'all' || 
      (objective.owner_name && objective.owner_name.includes(userFilter));
    
    return matchesSearchTerm && matchesStatus && matchesUser;
  }).map(objective => {
    // Garantir que activities existam para compatibilidade
    return {
      ...objective,
      activities: objective.activities || []
    };
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
