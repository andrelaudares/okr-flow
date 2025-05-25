
import { ActivityItem } from '@/types/okr';

export const getStatusColor = (status: ActivityItem['status']): string => {
  switch (status) {
    case 'Not Started':
      return 'bg-gray-200 text-gray-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'At Risk':
      return 'bg-yellow-100 text-yellow-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'On Hold':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};
