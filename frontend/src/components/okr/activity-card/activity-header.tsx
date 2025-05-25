
import React from 'react';
import { Calendar } from 'lucide-react';
import { ActivityItem } from '@/types/okr';
import { getStatusColor } from './status-utils';
import { statusLabel } from '../activity-constants';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityHeaderProps {
  activity: ActivityItem;
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({ activity }) => {
  // Format due date for display
  const formattedDueDate = activity.dueDate && (() => {
    try {
      const date = new Date(activity.dueDate);
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      return activity.dueDate;
    } catch (error) {
      return activity.dueDate;
    }
  })();

  return (
    <div className="flex-1">
      <h4 className="text-sm font-medium">{activity.title}</h4>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
          {statusLabel[activity.status]}
        </span>
        <span className="text-xs text-gray-500">
          {activity.assignee}
        </span>
      </div>
      {formattedDueDate && (
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Previsão: {formattedDueDate}</span>
        </div>
      )}
    </div>
  );
};

export default ActivityHeader;
